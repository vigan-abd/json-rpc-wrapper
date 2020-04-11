'use strict'

const RpcError = require('./rpc-error')

class RpcServiceBase {
  constructor () {
    /**
     * @property
     * @type {string[]}
     */
    this.methods = []
  }

  /**
   * @throws {RpcError}
   * @param {string} method
   */
  async validateMethod (method) {
    if (!this.methods.includes(method) || typeof this[method] !== 'function') {
      throw RpcError.createError(RpcError.METHOD_NOT_FOUND)
    }
  }

  /**
   * @throws {RpcError}
   * @param {string} method
   * @param {object|Array} params
   */
  async validateParams (method, params) {
    const res = await this.areParamsValid(method, params)
    if (!res) throw RpcError.createError(RpcError.INVALID_PARAMS)
  }

  /**
   * @param {string} method
   * @param {object|Array} params
   * @returns {boolean}
   */
  async areParamsValid (method, params) {
    throw new Error('ERR_METHOD_NOT_IMPLEMENTED')
  }
}

module.exports = RpcServiceBase
