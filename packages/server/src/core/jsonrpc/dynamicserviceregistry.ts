// src/ServiceRegistry.ts

import { JsonRpcErrorCode, RpcService, ServiceModule } from "./types"

type ExposedMethod = (...params: any[]) => Promise<any> | any

class DynamicServiceRegistry {
  private methods = new Map<string, ExposedMethod>()
  private loaded = false

  /**
   * Dynamically loads all services from a list of paths.
   */
  public async loadServices(servicePaths: string[]): Promise<void> {
    if (this.loaded) return

    const importPromises = servicePaths.map((path) => import(path))
    const modules = await Promise.all(importPromises)

    for (const mod of modules) {
      // Assume the module exports 'default' which contains the ServiceModule structure
      const { namespace, service } = mod.default as ServiceModule
      this.registerService(namespace, service)
    }

    this.loaded = true
    console.log(`\nSuccessfully loaded ${modules.length} service module(s).`)
  }

  /**
   * Internal function to register methods from a loaded service instance.
   */
  private registerService(namespace: string, serviceInstance: RpcService): void {
    const serviceName = namespace.toLowerCase()

    for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(serviceInstance))) {
      const method = (serviceInstance as any)[key]

      if (key !== "constructor" && typeof method === "function") {
        const rpcMethodName = `${serviceName}.${key}`

        const wrappedMethod = (...params: any[]) => {
          return method.apply(serviceInstance, params)
        }

        this.methods.set(rpcMethodName, wrappedMethod)
        console.log(`-> Registered: ${rpcMethodName}`)
      }
    }
  }

  /**
   * Executes an RPC method from the registry.
   */
  public async execute(method: string, params: any): Promise<any> {
    if (!this.loaded) {
      throw { code: JsonRpcErrorCode.InternalError, message: "Service registry not initialized." }
    }

    const func = this.methods.get(method)

    if (!func) {
      throw { code: JsonRpcErrorCode.MethodNotFound, message: `Method not found: ${method}` }
    }

    const args = Array.isArray(params) ? params : params ? Object.values(params) : []

    return func(...args)
  }
}

export const registry = new DynamicServiceRegistry()
