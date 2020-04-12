/**
 * Represents the base class from which rpc callable classes can be extended.
 * Extended classes can be wrapped through rpc wrapper and exposed via different
 * transport protocols as json rpc services.
 */
export abstract class RpcServiceBase {
  /**
   * Represents the list of methods that are exposed through rpc calls,
   * each method here should be implemented with the same name
   */
  methods: Array<string>

  /**
   * Checks if the method is available in service and can be called externally,
   * if not it throws the appropriate rpc error
   * It should not be overridden in extended classes!
   * @param {string} method - The method that will be checked if it exists and it's available
   */
  public validateMethod(method: string): void | Promise<void>

  /**
   * Checks if the params for the called method through rpc are valid,
   * if not it throws the appropriate rpc error.
   * It should not be overridden in extended classes!
   * @param {string} method - The method that will be called externally
   * @param {Object|Array<any>} params - The params that will be passed to the method
   */
  public validateParams(method: string, params: object | Array<any>): void | Promise<void>

  /**
   * The abstract that will verify if the provided params for the method are valid,
   * it should be implemented in all extended classes
   * @param {string} method - The method that will be called externally
   * @param {Object|Array<any>} params - The params that will be passed to the method
   */
  public abstract areParamsValid(method: string, params: object | Array<any>): boolean | Promise<boolean>
}
