import { logger } from "@/core/logger"
import { JsonRpcErrorCode, RpcService } from "./types"

// Type for the dynamic method map: 'namespace.method' -> function
type ExposedMethod = (...params: any[]) => Promise<any> | any

class ServiceRegistry {
  private methods = new Map<string, ExposedMethod>()

  /**
   * Registers a service instance, exposing its public methods under a given namespace.
   * @param namespace The prefix for the RPC methods (e.g., 'calc', 'user').
   * @param serviceInstance The instance of the class containing the RPC methods.
   */
  public registerService(namespace: string, serviceInstance: RpcService): void {
    const serviceName = namespace.toLowerCase()

    // Iterate over all properties of the service instance
    for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(serviceInstance))) {
      const method = (serviceInstance as any)[key]

      // Check if it's a function and not the constructor
      if (key !== "constructor" && typeof method === "function") {
        const rpcMethodName = `${serviceName}.${key}`

        // Wrap the method to ensure context (this) is correct and handle parameters
        const wrappedMethod = (...params: any[]) => {
          // Apply parameters based on position, allowing for named/positional flexibility
          return method.apply(serviceInstance, params)
        }

        this.methods.set(rpcMethodName, wrappedMethod)
        logger.debug(`Registered RPC method: ${rpcMethodName}`)
      }
    }
  }

  /**
   * Looks up and executes an RPC method.
   * @param method The full RPC method name (e.g., 'calc.add').
   * @param params The parameters array or object.
   */
  public async execute(method: string, params: any): Promise<any> {
    const func = this.methods.get(method)

    if (!func) {
      // Throw an object error for easy JSON-RPC error mapping
      throw { code: JsonRpcErrorCode.MethodNotFound, message: `Method not found: ${method}` }
    }

    // Determine arguments: Positional array or values from a named object
    const args = Array.isArray(params) ? params : params ? Object.values(params) : []

    return func(...args)
  }
}

export const registry = new ServiceRegistry()
