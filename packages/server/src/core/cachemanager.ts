import { logger } from "@/core/logger"
import { Config } from "@/core/config"
const Memcached = require("memcached")

export class CacheManager {
  public static enabled() {
    const cfg: Config = Config.load()
    return cfg.enableRequestCache
  }

  public static async flush() {
    if (!CacheManager.enabled()) {
      return false
    }
    logger.log("Flushing cache")
    return new Promise<any>((resolve, reject) => {
      const memcached = new Memcached("127.0.0.1:11211")
      memcached.flush((err, data) => {
        if (err) {
          logger.error("Error flushing cache", err)
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  public static async get(key: string) {
    return new Promise<any>((resolve, reject) => {
      if (!CacheManager.enabled()) {
        reject()
        return
      }

      const memcached = new Memcached("127.0.0.1:11211")

      memcached.get(key, (err, data) => {
        if (err) {
          reject(err)
          return
        }

        resolve(data)
      })
    })
  }

  public static async set(key: string, value: any) {
    return new Promise<any>((resolve, reject) => {
      if (!CacheManager.enabled()) {
        reject()
        return
      }

      const cfg: Config = Config.load()
      const memcached = new Memcached("127.0.0.1:11211")
      const cacheLifetime = cfg.requestCacheLifetimeSeconds ?? 7200

      memcached.set(key, value, cacheLifetime, (err) => {
        if (err) {
          reject(err)
          return
        }

        resolve(true)
      })
    })
  }
}
