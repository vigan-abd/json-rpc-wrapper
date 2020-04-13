import { JsonRpcErrorFields, RpcError } from './rpc-error'
import { RpcServiceBase } from './rpc-service-base'

/**
 * Represents the rpc wrapper class that will wrap requests and responses for any object/instance.
 * This class can be used to rpcify the variables and make them callable through json rpc 2.0 protocol.
 * Keep in mind that only functions can be invoked, there's no way to invoke getting/setting properties
 * of object! This instance will act as a proxy to the wrapped object, and can call any function type in object
 * (with callbacks, async functions and simple functions)
 */
export class RpcWrapper {
  /**
   * @param {RpcServiceBase|Object} service - The object/instance that will be wrapped. It can be any object type
   *    but if it's extension of RpcServiceBase it will validate also params passed to method during the call.
   *    In case if it's a simple object then it should be responsibility of the method itself to validate the
   *    passed arguments. In case it's instance of RpcServiceBase then the service will be stored into service property,
   *    otherwise it will be stored in proxy property
   * @param {Array<string>} [cbMethods=[]] - Optional methods that use callbacks. Here we should specify all methods
   *    that use callbacks to pass the responses. Each method that has callbacks should support this callback structure:
   *    (err?: Error, res?: any) => void
   */
  constructor(service: RpcServiceBase | Object, cbMethods?: Array<string>)

  /**
   * The service that will be proxied
   */
  protected service: RpcServiceBase

  /**
   * The object that will be proxied
   */
  protected proxy: Object

  /**
   * Methods of the object that uses callbacks
   */
  protected cbMethods: Array<string>

  /**
   * This method invokes the json rpc requests against the wrapped object/instance.
   * The response can be an array, single item or void depending on request.
   * @public
   * @param {string} payload - JSON payload that is received through transport layer,
   *    e.g. {"jsonrpc": "2.0", "method": "sum", "params": [1,2,4], "id": "1"}
   * @returns {Promise<JsonRpcResponse|Array<JsonRpcResponse>|void>} e.g. {"jsonrpc": "2.0", "result": 7, "id": "1"}
   */
  public callReq(payload: string): Promise<JsonRpcResponse | Array<JsonRpcResponse> | void>

  /**
   * Validates the received request and invokes the method on proxied object,
   * and in case of id param returns the response.
   * @param {JsonRpcRequest} req - Request object received through the proxy call
   * @returns {Promise<JsonRpcResponse|void>} e.g. {"jsonrpc": "2.0", "result": 7, "id": "1"}
   */
  protected _procReq(req: JsonRpcRequest): Promise<JsonRpcResponse | void>

  /**
   * Crafts the json rpc response based on input
   * @param {string|number} [id] - Optional request id
   * @param {RpcError} [err] - Optional error object
   * @param {any} [res] - Optional response object, ignored in case when err is present
   * @returns {JsonRpcResponse}
   */
  protected _createRes(id?: string | number | null, err?: RpcError | null, res?: any): JsonRpcResponse

  /**
   * Calls the function inside the proxied object with specified arguments
   * @param {Function} func - The function of the proxied object that will be invoked
   * @param {any} params - The params that will be passed, in case if rpc request is array
   *    params are passed in order, otherwise single object is passed
   * @returns {any}
   */
  protected _execFunc(func: Function, params: any): any
}

export interface JsonRpcRequest {
  jsonrpc: '2.0'
  method: string
  params?: Object | Array<any>
  id?: string | number
}

export interface JsonRpcResponse {
  jsonrpc: '2.0'
  error?: JsonRpcErrorFields
  result?: any
  id?: string | number
}
