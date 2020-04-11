'use strict'

const RpcError = require('./rpc-error')
const RpcServiceBase = require('./rpc-service-base')
const utils = require('./utils')
const { promisify } = require('util')

class RpcWrapper {
  /**
   * @constructor
   * @param {RpcServiceBase|Object} service
   * @param {Array<string>} cbMethods
   */
  constructor (service, cbMethods = []) {
    if (!service) throw new Error('ERR_SERVICE_REQUIRED')
    if (typeof service !== 'object') {
      throw new Error('ERR_SERVICE_NOT_OBJECT')
    }

    if (service instanceof RpcServiceBase) {
      this.service = service
    } else {
      this.proxy = service
    }

    this.cbMethods = [...cbMethods]
  }

  /**
   * @param {string} payload
   */
  async callReq (payload) {
    let req = null
    try {
      req = JSON.parse(payload)
    } catch (err) {
      return this._createRes(null, RpcError.createError(RpcError.PARSE_ERROR))
    }

    let res = null
    if (Array.isArray(req)) {
      res = await Promise.all(req.map(r => this._procReq(r)))
      res = res.filter(r => !utils.isNil(r))
      if (res.length > 0) return res
    } else {
      res = await this._procReq(req)
      if (!utils.isNil(res)) return res
    }
  }

  /**
   * @param {{
        jsonrpc: '2.0',
        method: string,
        params: any,
        id?: string|number
      }} req
   */
  async _procReq (req) {
    if (!(typeof req === 'object' && !Array.isArray(req))) {
      return this._createRes(null, RpcError.createError(RpcError.INVALID_REQUEST))
    }

    if (!utils.isStringOrNumber(req.id) && !utils.isNil(req.id)) {
      return this._createRes(null, RpcError.createError(RpcError.INVALID_REQUEST))
    }

    if (!req.method || typeof req.method !== 'string') {
      return this._createRes(req.id, RpcError.createError(RpcError.INVALID_REQUEST))
    }

    if (!utils.isNil(req.params) && typeof req.params !== 'object') { // array is object
      return this._createRes(req.id, RpcError.createError(RpcError.INVALID_REQUEST))
    }

    const sendRes = !utils.isNil(req.id)

    try {
      if (this.service) {
        await this.service.validateMethod(req.method)
        await this.service.validateParams(req.method, req.params)
      }

      if (this.proxy && typeof this.proxy[req.method] !== 'function') {
        throw RpcError.createError(RpcError.METHOD_NOT_FOUND)
      }

      const caller = this.service ? this.service : this.proxy
      const res = await this._execFunc(
        (this.cbMethods.includes(req.method) ? promisify(caller[req.method]) : caller[req.method]).bind(caller),
        req.params
      )

      if (sendRes) return this._createRes(req.id, null, res)
    } catch (err) {
      if (sendRes) {
        return this._createRes(
          req.id,
          err instanceof RpcError ? err : RpcError.createError(
            RpcError.SERVER_ERROR, null, err.toString())
        )
      }
    }
  }

  /**
   * @param {string|number} [id]
   * @param {RpcError} [err]
   * @param {any} [res]
   * @returns {{
        jsonrpc: '2.0',
        error?: { code: number, message: string, data?: any },
        result?: any,
        id?: string|number
      }}
   */
  _createRes (id, err, res) {
    const json = {
      jsonrpc: '2.0'
    }
    if (!utils.isNil(err)) json.error = err
    else if (!utils.isNil(res)) json.result = res
    else json.result = null
    json.id = utils.isStringOrNumber(id) ? id : null

    return json
  }

  _execFunc (func, params) {
    if (Array.isArray(params)) return func(...params)
    if (utils.isNil(params)) return func()
    return func(params)
  }
}

module.exports = RpcWrapper
