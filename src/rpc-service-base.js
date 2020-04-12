'use strict'

const { RpcError } = require('./rpc-error')

/**
 * Represents the base class from which rpc callable classes can be extended.
 * Extended classes can be wrapped through rpc wrapper and exposed via different
 * transport protocols as json rpc services.
 * @class
 * @abstract
 * @example
 * class ProductService extends RpcServiceBase {
 *   constructor (products = []) {
 *     super()
 *
 *     this.methods.push('create', 'find')
 *     this.products = products
 *   }
 *
 *   create (item) { return this.products.push(item) }
 *   find (id) { return this.products.find(p => p.id === id) }
 *   remove (id) { this.products = this.products.filter(p => p.id !== id) }
 *
 *   async areParamsValid (method, params) {
 *     switch (method) {
 *       case 'create':
 *         if (!params.id || typeof params.id !== 'number') return false
 *         if (!params.name || typeof params.name !== 'string') return false
 *         return true
 *       case 'find':
 *         return params[0] && typeof params[0] === 'number'
 *       default: return false
 *     }
 *   }
 * }
 *
 * const myService = new ProductService([ { id: 1, name: 'Product 1' }, { id: 2, name: 'Product 2' } ])
 * const rpcProxy = new RpcWrapper(myService)
 * const payload = '{"jsonrpc":"2.0","method":"find","params":[1],"id":"3"}'
 * const rpcRes = await rpcProxy.callReq(payload) // '{"jsonrpc":"2.0","id":"3","result":{"id":1,"name":"Product 1"}}'
 */
class RpcServiceBase {
  constructor () {
    /**
     * @protected
     * @property {Array<string>} methods - Represents the list of methods that are exposed through rpc calls,
     *    each method here should be implemented with the same name
     */
    this.methods = []
  }

  /**
   * Checks if the method is available in service and can be called externally,
   * if not it throws the appropriate rpc error
   * It should not be overridden in extended classes!
   * @throws {RpcError}
   * @param {string} method - The method that will be checked if it exists and it's available
   * @returns {Promise<void>|void}
   */
  async validateMethod (method) {
    if (!this.methods.includes(method) || typeof this[method] !== 'function') {
      throw RpcError.createError(RpcError.METHOD_NOT_FOUND)
    }
  }

  /**
   * Checks if the params for the called method through rpc are valid,
   * if not it throws the appropriate rpc error.
   * It should not be overridden in extended classes!
   * @throws {RpcError}
   * @param {string} method - The method that will be called externally
   * @param {Object|Array<any>} params - The params that will be passed to the method
   * @returns {Promise<void>|void}
   */
  async validateParams (method, params) {
    const res = await this.areParamsValid(method, params)
    if (!res) throw RpcError.createError(RpcError.INVALID_PARAMS)
  }

  /**
   * The abstract that will verify if the provided params for the method are valid,
   * it should be implemented in all extended classes
   * @abstract
   * @param {string} method - The method that will be called externally
   * @param {Object|Array<any>} params - The params that will be passed to the method
   * @returns {Promise<boolean>|boolean}
   */
  async areParamsValid (method, params) {
    throw new Error('ERR_METHOD_NOT_IMPLEMENTED')
  }
}

module.exports = { RpcServiceBase }
