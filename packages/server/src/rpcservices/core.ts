import { CacheManager } from "@/core/cachemanager"
import { ApplyConfig, Config, ConfigWriter } from "@/core/config"
import { RpcService, ServiceModule } from "@/core/jsonrpc/types"
import { Alsa } from "@/services/alsa/"
import { Mixer } from "@/services/mixer/"
import { SpotifyAuth } from "@/services/spotify/spotifyauth"
const Memcached = require("memcached")

class CoreService implements RpcService {
  public async cache_flush() {
    return CacheManager.flush()
  }

  public async cache_stats() {
    return new Promise<any>((resolve, reject) => {
      const memcached = new Memcached("127.0.0.1:11211")
      memcached.stats((err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  public config_get() {
    return Config.load()
  }

  public async config_set(config: any) {
    let cfg: Config = Config.load()
    let newCfg: Config = JSON.parse(JSON.stringify(cfg))
    newCfg.enableBitPerfectPlayback = config.enableBitPerfectPlayback
    newCfg.enableRequestCache = config.enableRequestCache
    newCfg.requestCacheLifetimeSeconds = config.requestCacheLifetimeSeconds
    newCfg.nightStartHour = config.nightStartHour
    newCfg.nightEndHour = config.nightEndHour
    newCfg.announceTimeHourly = config.announceTimeHourly
    newCfg.timezone = config.timezone
    newCfg.locale = config.locale
    newCfg.clockType = config.clockType
    newCfg.snapcastCodec = config.snapcastCodec
    newCfg.snapcastChunkMs = config.snapcastChunkMs
    newCfg.snapcastBuffer = config.snapcastBuffer
    ConfigWriter(newCfg)
    await ApplyConfig(cfg, newCfg)
    return newCfg
  }

  public ping() {
    return "pong"
  }

  public soundcap() {
    const alsa = new Alsa()
    let res: any = {}
    res = alsa.getCardInfo()
    return res
  }

  public async status() {
    return Mixer.getStatus()
  }

  public async user() {
    return SpotifyAuth.getProfile()
  }
}

export const namespace = "core"
export const service = new CoreService()

const module: ServiceModule = { namespace, service }
export default module
