import { logger } from "@/core/logger"
import * as fs from "fs"
import * as path from "path"
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

    const paths = servicePaths
      .map((pathname) =>
        fs
          .readdirSync(pathname, { withFileTypes: true })
          .filter((file) => {
            return [".ts", ".js"].includes(path.extname(file.name).toLowerCase())
          })
          .map((de) => path.join(de.parentPath, de.name)),
      )
      .flat()

    const importPromises = paths.map((path) => import(path))
    const modules = await Promise.all(importPromises)

    for (const mod of modules) {
      const { namespace, service } = mod.default as ServiceModule
      logger.trace(namespace, service)
      this.registerService(namespace, service)
    }

    this.loaded = true
    logger.trace(`\nSuccessfully loaded ${modules.length} service module(s).`)
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
        logger.trace(`-> Registered: ${rpcMethodName}`)
      }
    }
  }

  /**
   * Executes an RPC method from the registry.
   */
  public async execute(method: string, params: any): Promise<any> {
    if (!this.loaded) {
      logger.error("Service registry not initialized.")
      throw { code: JsonRpcErrorCode.InternalError, message: "Service registry not initialized." }
    }

    const func = this.methods.get(method.replace("-", "_"))

    if (!func) {
      logger.error(`Method not found: ${method}`)
      throw { code: JsonRpcErrorCode.MethodNotFound, message: `Method not found: ${method}` }
    }

    const args = Array.isArray(params) ? params : params ? Object.values(params) : []

    try {
      return func(...args)
    } catch (err) {
      logger.error(err)
      throw err
    }
  }
}

export const registry = new DynamicServiceRegistry()
