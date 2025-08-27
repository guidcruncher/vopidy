import * as fs from "fs"
import * as path from "path"
import { Alsa } from "@/services/alsa"
import { logger } from "@/core/logger"
import { pm2 } from "@/core/pm2"

export class Config {
  public enableIcecast: boolean = true
  public enableBitPerfectPlayback: boolean = false
  public enableRequestCache: boolean = true
  public enableImageCache: boolean = true
  public communicationMode: string = "http"
  public requestCacheLifetimeSeconds: number = 7200
  public imageCacheMaxAgeHours: number = 24
  public alsaLoopbackCapable: boolean = true

  public static load(): Config {
    const filename = path.join(process.env.VOPIDY_CONFIG as string, "vopidy-config.json")
    let cfg: Config

    if (!fs.existsSync(filename)) {
      cfg = new Config()
      ConfigWriter(cfg)
      return cfg
    }

    let json = fs.readFileSync(filename, "utf8")
    cfg = JSON.parse(json)

    cfg.alsaLoopbackCapable = (process.env.LOOPBACK_SUPPORT ?? "false").toString() === "true"

    return cfg
  }
}

export const ConfigWriter = (cfg: Config) => {
  const filename = path.join(process.env.VOPIDY_CONFIG as string, "vopidy-config.json")
  const json = JSON.stringify(cfg, null, 4)
  fs.writeFileSync(filename, json, "utf8")
}

export const ApplyConfig = (o: Config, n: Config) => {
  logger.debug("Applying config changes")

  if (o.enableBitPerfectPlayback != n.enableBitPerfectPlayback) {
    logger.debug(`enableBitPerfectPlayback changed to ${n.enableBitPerfectPlayback}`)
    const alsa = new Alsa()
    alsa.setBitperfectPlayback(n.enableBitPerfectPlayback)
  }

  if (o.enableRequestCache != n.enableRequestCache) {
    logger.debug(`enableRequestCache changed to ${n.enableRequestCache}`)
    pm2.exec(n.enableRequestCache ? "start" : "stop", ["memcached"])
  }

  if (o.enableIcecast != n.enableIcecast) {
    logger.debug(`enableIcecast changed to ${n.enableIcecast}`)
    pm2.exec(n.enableIcecast ? "start" : "stop", ["icecast", "ffmpeg"])
  }
}
