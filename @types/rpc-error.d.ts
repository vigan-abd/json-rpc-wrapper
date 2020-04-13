/**
 * Represents the json rpc error base structure, it accepts 3 params: code, message, data as specified by the protocol
 */
export class RpcError extends Error {
  /**
   * @param {number} code - json rpc error code
   * @param {string} message - json rpc error message
   * @param {any} [data] - json rpc additional error data
   */
  constructor(code: number, message: string, data?: any)

  /**
   * Represents json rpc error code, e.g. -32700.
   * If invalid code range is provided -32000 (Server Error) is used,
   * allowed codes:  [-32603, -32600], -32700, [-32099, -32000]
   */
  code: number

  /**
   * Represents additional error data specified by protocol
   */
  data: any

  /**
   * Represents the json rpc error message, e.g. Parse error
   */
  message: string

  /**
   * Returns the json representing the error, e.g.: '{"code":-32602,"message":"Invalid params","data":"foo param is required"}'
   * @returns {string}
   */
  toString(): string

  /**
   * Returns the fields that should be exposed on json serialization
   * @returns {JsonRpcErrorFields}
   */
  toJSON(): JsonRpcErrorFields

  /**
   * @param {number} code - json rpc error code, if invalid code range is provided -32000 (Server Error) is used,
   *    allowed codes:  [-32603, -32600], -32700, [-32099, -32000]
   * @param {string} [message] - json rpc error message, if omitted it will be generated based on error code
   * @param {any} [data] - json rpc additional error data
   * @returns {RpcError}
   */
  static createError(code: number, message?: string | null, data?: any): RpcError

  static readonly PARSE_ERROR: -32700
  static readonly INVALID_REQUEST: -32600
  static readonly METHOD_NOT_FOUND: -32601
  static readonly INVALID_PARAMS: -32602
  static readonly INTERNAL_ERROR: -32603
  static readonly SERVER_ERROR: -32000
}

export interface JsonRpcErrorFields {
  /**
   * RpcError code field
   */
  code: number;

  /**
   * Error message field
   */
  message: string;

  /** 
   * RpcError data field, present only if not nil
   */
  data?: any
}
