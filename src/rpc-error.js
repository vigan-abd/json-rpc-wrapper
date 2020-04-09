'use strict'

const PARSE_ERROR = -32700
const INVALID_REQUEST = -32600
const METHOD_NOT_FOUND = -32601
const INVALID_PARAMS = -32602
const INTERNAL_ERROR = -32603
const SERVER_ERROR = -32000

class RpcError extends Error {
  /**
   * @param {number} code
   * @param {string} message
   * @param {*} data
   */
  constructor (code, message, data = null) {
    super(message)

    this.code = code
    this.data = data
  }

  toString () {
    return JSON.stringify(this.toJSON())
  }

  toJSON () {
    const json = { code: this.code, message: this.message }
    if (this.data) json.data = this.data
    return json
  }

  /**
   * @param {number} code
   * @param {string} [message]
   * @param {} [data]
   */
  static createError (code, message = null, data = null) {
    switch (code) {
      case PARSE_ERROR: return new RpcError(PARSE_ERROR, message || 'Parse error', data)
      case INVALID_REQUEST: return new RpcError(INVALID_REQUEST, message || 'Invalid request', data)
      case METHOD_NOT_FOUND: return new RpcError(METHOD_NOT_FOUND, message || 'Method not found', data)
      case INVALID_PARAMS: return new RpcError(INVALID_PARAMS, message || 'Invalid params', data)
      case INTERNAL_ERROR: return new RpcError(INTERNAL_ERROR, message || 'Internal error', data)
      case SERVER_ERROR: return new RpcError(SERVER_ERROR, message || 'Server error', data)
      default: return new Error(code, message, data)
    }
  }
}

module.exports = RpcError
module.exports.PARSE_ERROR = PARSE_ERROR
module.exports.INVALID_REQUEST = INVALID_REQUEST
module.exports.METHOD_NOT_FOUND = METHOD_NOT_FOUND
module.exports.INVALID_PARAMS = INVALID_PARAMS
module.exports.INTERNAL_ERROR = INTERNAL_ERROR
module.exports.SERVER_ERROR = SERVER_ERROR
