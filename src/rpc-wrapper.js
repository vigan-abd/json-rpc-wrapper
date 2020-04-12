'use strict'

const { RpcError } = require('./rpc-error')
const { RpcServiceBase } = require('./rpc-service-base')
const utils = require('./utils')
const { promisify } = require('util')

/**
 * Represents the rpc wrapper class that will wrap requests and responses for any object/instance.
 * This class can be used to rpcify the variables and make them callable through json rpc 2.0 protocol.
 * Keep in mind that only functions can be invoked, there's no way to invoke getting/setting properties
 * of object! This instance will act as a proxy to the wrapped object, and can call any function type in object
 * (with callbacks, async functions and simple functions)
 * @class
 * @example
 * // RpcServiceBase extended class
 * const myService = new ProductService([ { id: 1, name: 'Product 1' }, { id: 2, name: 'Product 2' } ])
 * const rpcProxy = new RpcWrapper(myService)
 * const payload = '{"jsonrpc":"2.0","method":"find","params":[1],"id":"3"}'
 * const rpcRes = await rpcProxy.callReq(payload) // '{"jsonrpc":"2.0","id":"3","result":{"id":1,"name":"Product 1"}}'
 * @example
 * // Object with callback methods
 * const service1 = {
 *   storeContent: (content, cb) => {
 *     fs.writeFile('test.log', content + '\n', { flag: 'a' }, cb)
 *   }
 * }
 * const proxy1 = new RpcWrapper(service1, ['storeContent'])
 * @example
 * // Simple object
 * const myService = {
 *   ping: async () => Date.now(),
 *   echo: (params) => params,
 * }
 * const rpcProxy = new RpcWrapper(myService)
 */
class RpcWrapper {
  /**
   * @typedef {Object} JsonRpcRequest
   * @property {'2.0'} jsonrpc
   * @property {string} method
   * @property {Object|Array} [params]
   * @property {string|number} [id]
   */

  /**
   * @typedef {Object} JsonRpcResponse
   * @property {'2.0'} jsonrpc
   * @property {Object} [error]
   * @property {number} error.code - RpcError code field
   * @property {string} error.message - Error message field
   * @property {any} [error.data] - RpcError data field, present only if not nil
   * @property {any} [result]
   * @property {string|number} [id]
   */

  /**
   * @constructor
   * @param {RpcServiceBase|Object} service - The object/instance that will be wrapped. It can be any object type
   *    but if it's extension of RpcServiceBase it will validate also params passed to method during the call.
   *    In case if it's a simple object then it should be responsibility of the method itself to validate the
   *    passed arguments. In case it's instance of RpcServiceBase then the service will be stored into service property,
   *    otherwise it will be stored in proxy property
   * @param {Array<string>} [cbMethods=[]] - Optional methods that use callbacks. Here we should specify all methods
   *    that use callbacks to pass the responses. Each method that has callbacks should support this callback structure:
   *    (err?: Error, res?: any) => void
   */
  constructor (service, cbMethods = []) {
    if (!service) throw new Error('ERR_SERVICE_REQUIRED')
    if (typeof service !== 'object') {
      throw new Error('ERR_SERVICE_NOT_OBJECT')
    }

    if (service instanceof RpcServiceBase) {
      /**
       * The service that will be proxied
       * @protected
       * @property {RpcServiceBase} [service]
       */
      this.service = service
    } else {
      /**
       * The object that will be proxied
       * @protected
       * @property {Object} [proxy]
       */
      this.proxy = service
    }

    /**
     * Methods of the object that uses callbacks
     * @protected
     * @property {Array<string>} cbMethods
     */
    this.cbMethods = [...cbMethods]
  }

  /**
   * This method invokes the json rpc requests against the wrapped object/instance.
   * The response can be an array, single item or void depending on request.
   * @public
   * @param {string} payload - JSON payload that is received through transport layer,
   *    e.g. {"jsonrpc": "2.0", "method": "sum", "params": [1,2,4], "id": "1"}
   * @returns {Promise<JsonRpcResponse|Array<JsonRpcResponse>|void>} e.g. {"jsonrpc": "2.0", "result": 7, "id": "1"}
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
   * Validates the received request and invokes the method on proxied object,
   * and in case of id param returns the response.
   * @protected
   * @param {JsonRpcRequest} req - Request object received through the proxy call
   * @returns {Promise<JsonRpcResponse|void>} e.g. {"jsonrpc": "2.0", "result": 7, "id": "1"}
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
   * Crafts the json rpc response based on input
   * @protected
   * @param {string|number} [id] - Optional request id
   * @param {RpcError} [err] - Optional error object
   * @param {any} [res] - Optional response object, ignored in case when err is present
   * @returns {JsonRpcResponse}
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

  /**
   * Calls the function inside the proxied object with specified arguments
   * @protected
   * @param {Function} func - The function of the proxied object that will be invoked
   * @param {any} params - The params that will be passed, in case if rpc request is array
   *    params are passed in order, otherwise single object is passed
   * @returns {any}
   */
  _execFunc (func, params) {
    if (Array.isArray(params)) return func(...params)
    if (utils.isNil(params)) return func()
    return func(params)
  }
}

module.exports = { RpcWrapper }
