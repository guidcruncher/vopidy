import { Config } from "@/core/config"
import { logger } from "@/core/logger"
import { CacheContainer } from "node-ts-cache"
import { MemoryStorage } from "node-ts-cache-storage-memory"

const cache = new CacheContainer(new MemoryStorage())

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
    await cache.clear()
  }

  public static async delete(key: string) {
    try {
      await cache.setItem(key, undefined, { ttl: 1 })
      return true
    } catch (err) {
      return false
    }
  }

  public static async get(key: string) {
    if (!CacheManager.enabled()) {
      return undefined
    }

    const data = await cache.getItem<any>(key)
    return data
  }

  public static async set(key: string, value: any) {
    if (!CacheManager.enabled()) {
      return
    }

    const cfg: Config = Config.load()
    const ttl = cfg.requestCacheLifetimeSeconds ?? 1800
    return await cache.setItem(key, value, { ttl: ttl })
  }
}
