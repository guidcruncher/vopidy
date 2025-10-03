import { Config } from "@/core/config"
import { logger } from "@/core/logger"
import { cache } from  "ts-cache"

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
    cache.flushAll()
  }

  public static async delete(key: string) {
    if (cache.has(key)) {
      cache.delete(key)
      return true
    }

    return false
  }

  public static async get(key: string) {
    return new Promise<any>((resolve, reject) => {
      if (!CacheManager.enabled()) {
        reject()
        return
      }

      if (!cache.has(key)) {
        reject()
      } else {
        return cache.get(key)
      }
    })
  }

  public static async set(key: string, value: any) {
    return new Promise<any>((resolve, reject) => {
      if (!CacheManager.enabled()) {
        reject()
        return
      }

      const cfg: Config = Config.load()
      const ttl = cfg.requestCacheLifetimeSeconds ?? 1800
      cache.set(key, value, ttl)
    })
  }
}
