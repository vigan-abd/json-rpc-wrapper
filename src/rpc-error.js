'use strict'

const utils = require('./utils')

/**
 * Represents the json rpc error base structure, it accepts 3 params: code, message, data as specified by the protocol
 * @class
 * @example
 * RpcError.createError(RpcError.INVALID_REQUEST) // RpcError: { code: -32600, message: 'Invalid request' }
 * RpcError.createError(RpcError.INVALID_REQUEST, null, new Error('foo')) // RpcError: { code: -32600, message: 'Invalid request', data: 'Error: foo' }
 * RpcError.createError(RpcError.INVALID_REQUEST, 'INV_REQ', new Error('foo')) // RpcError: { code: -32600, message: 'INV_REQ', data: 'Error: foo' }
 */
class RpcError extends Error {
  /**
   * Fields that should be exported during serialization
   * @typedef {Object} JsonRpcErrorFields
   * @property {number} code - RpcError code field
   * @property {string} message - Error message field
   * @property {any} [data] - RpcError data field, present only if not nil
   */

  /**
   * @constructor
   * @param {number} code - json rpc error code
   * @param {string} message - json rpc error message
   * @param {any} [data] - json rpc additional error data
   */
  constructor (code, message, data = null) {
    super(message)

    /**
     * @property {number} code - Represents json rpc error code, e.g. -32700.
     *    If invalid code range is provided -32000 (Server Error) is used,
     *    allowed codes:  [-32603, -32600], -32700, [-32099, -32000]
     */
    this.code = code
    if (!utils.isNil(data)) {
      /**
       * @property {any} data - Represents additional error data specified by protocol
       */
      this.data = data
    }

    /**
     * @property {string} message - Represents the json rpc error message, e.g. Parse error
     */
    this.message = message

    // [-32603, -32600],
    // -32700
    // [-32099, -32000]
    if (!(this.code >= RpcError.INTERNAL_ERROR && this.code <= RpcError.INVALID_REQUEST) &&
      this.code !== RpcError.PARSE_ERROR &&
      !(this.code >= -32099 && this.code <= RpcError.SERVER_ERROR)) {
      this.code = RpcError.SERVER_ERROR
    }
  }

  /**
   * Returns the json representing the error, e.g.: '{"code":-32602,"message":"Invalid params","data":"foo param is required"}'
   * @returns {string}
   */
  toString () {
    return JSON.stringify(this.toJSON())
  }

  /**
   * Returns the fields that should be exposed on json serialization
   * @returns {JsonRpcErrorFields}
   */
  toJSON () {
    const json = { code: this.code, message: this.message }
    if (!utils.isNil(this.data)) json.data = this.data
    return json
  }

  /**
   * @param {number} code - json rpc error code, if invalid code range is provided -32000 (Server Error) is used,
   *    allowed codes:  [-32603, -32600], -32700, [-32099, -32000]
   * @param {string} [message] - json rpc error message, if omitted it will be generated based on error code
   * @param {any} [data] - json rpc additional error data
   * @returns {RpcError}
   */
  static createError (code, message = null, data = null) {
    switch (code) {
      case RpcError.PARSE_ERROR: return new RpcError(RpcError.PARSE_ERROR, message || 'Parse error', data)
      case RpcError.INVALID_REQUEST: return new RpcError(RpcError.INVALID_REQUEST, message || 'Invalid request', data)
      case RpcError.METHOD_NOT_FOUND: return new RpcError(RpcError.METHOD_NOT_FOUND, message || 'Method not found', data)
      case RpcError.INVALID_PARAMS: return new RpcError(RpcError.INVALID_PARAMS, message || 'Invalid params', data)
      case RpcError.INTERNAL_ERROR: return new RpcError(RpcError.INTERNAL_ERROR, message || 'Internal error', data)
      case RpcError.SERVER_ERROR: return new RpcError(RpcError.SERVER_ERROR, message || 'Server error', data)
      default: return new RpcError(code, message || 'Server error', data)
    }
  }

  /**
   * -32700
   * @memberof RpcError
   * @constant {number}
   */
  static get PARSE_ERROR () { return -32700 }

  /**
   * -32600
   * @memberof RpcError
   * @constant {number}
   */
  static get INVALID_REQUEST () { return -32600 }

  /**
   * -32601
   * @memberof RpcError
   * @constant {number}
   */
  static get METHOD_NOT_FOUND () { return -32601 }

  /**
   * -32602
   * @memberof RpcError
   * @constant {number}
   */
  static get INVALID_PARAMS () { return -32602 }

  /**
   * -32603
   * @memberof RpcError
   * @constant {number}
   */
  static get INTERNAL_ERROR () { return -32603 }

  /**
   * -32000
   * @memberof RpcError
   * @constant {number}
   */
  static get SERVER_ERROR () { return -32000 }
}

module.exports = { RpcError }
