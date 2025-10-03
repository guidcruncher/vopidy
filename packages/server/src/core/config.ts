import { logger } from "@/core/logger"
import * as fs from "fs"
import * as path from "path"
import { CacheManager } from "./cachemanager"

export class Config {
  public enableBitPerfectPlayback: boolean = false
  public enableRequestCache: boolean = true
  public enableImageCache: boolean = true
  public communicationMode: string = "http"
  public requestCacheLifetimeSeconds: number = 7200
  public imageCacheMaxAgeHours: number = 24
  public alsaLoopbackCapable: boolean = true
  public nightStartHour: number = 23
  public nightEndHour: number = 6
  public announceTimeHourly: boolean = true
  public timezone: string = "UTC"
  public locale: string = "en-US"
  public clockType: string = "analog"
  public snapcastCodec: string = "flac"
  public snapcastChunkMs: number = 26
  public snapcastBuffer: number = 1000

  public static isNight(): boolean {
    const config = Config.load()
    if (!config.nightStartHour) {
      return false
    }

    const hour = Config.localDate().getHours()
    return !(hour >= config.nightEndHour && hour < config.nightStartHour)
  }

  public static localDate(): Date {
    const config = Config.load()
    const tz = config.timezone ?? "Universal"

    let date_string = new Date().toLocaleString("en-US", { timeZone: tz })
    return new Date(date_string)
  }

  public static localDateString() {
    const config = Config.load()
    const locale = config.locale ?? "en-US"
    const date = new Date()
    let fmt = new Intl.DateTimeFormat(locale, {
      timeStyle: "short",
      timeZone: config.timezone ?? "Universal",
    })

    if (config.nightEndHour && config.nightEndHour == date.getHours()) {
      fmt = new Intl.DateTimeFormat(locale, {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: config.timezone ?? "Universal",
      })
    }

    return fmt.format(date) + " " + (date.getHours() < 12 ? "am" : "pm ")
  }

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

  if (fs.existsSync(filename)) {
    fs.copyFileSync(filename, filename + ".bak")
  }

  fs.writeFileSync(filename, json, "utf8")
}

export const ApplyConfig = async (o: Config, n: Config) => {
  logger.debug("Applying config changes")
  if (o.enableRequestCache != n.enableRequestCache) {
    CacheManager.flush()
  }
}
