import * as fs from "fs"
import * as path from "path"
import { logger } from "@/core/logger"
import { spawn } from "node:child_process"
import { Mpd } from "@/services/mpd"
import { pm2 } from "@/core/pm2"

export class Alsa {
  public async getCardInfo() {
    let res: any[] = []

    const aplay = () => {
      let d = ""
      const p = spawn("aplay", ["-l"])
      return new Promise((resolveFunc) => {
        p.stdout.on("data", (x) => {
          d += x.toString()
        })
        p.on("exit", (code) => {
          resolveFunc(d)
        })
      })
    }

    let cards = ((await aplay()) as any).split("\n")
    for (let line of cards) {
      if (line.startsWith("card ")) {
        let args = line.split(",")
        if (args[0].startsWith("card")) {
          args[0] = args[0].trim().slice(4).trim()
          const cardinfo = args[0].split(":")
          if (args[1].trim().startsWith("device")) {
            args[1] = args[1].trim().slice(6)
            const devinfo = args[1].split(":")
            res.push({
              address: `hw:${cardinfo[0].trim()},${devinfo[0].trim()}`,
              cardid: parseInt(cardinfo[0].trim()),
              card: cardinfo[1].trim(),
              deviceid: parseInt(devinfo[0].trim()),
              device: devinfo[1].trim(),
            })
          }
        }
      }
    }

    return res
  }

  public async setBitperfectPlayback(enable: boolean) {
    const mpdConf = path.join(process.env.VOPIDY_CONFIG, "mpd.conf")
    const libRespotConf = path.join(process.env.VOPIDY_CONFIG, "config.yml")
    const mpdClient = new Mpd()

    if (enable.toString() == "true") {
      logger.debug("Enabling Bitperfect playback, changing config")
      fs.copyFileSync("/srv/defaults/config-bitperfect.yml", libRespotConf)
    } else {
      logger.debug("Disabling Bitperfect playback, changing config")

      fs.copyFileSync("/srv/defaults/config.yml", libRespotConf)
    }

    await mpdClient.setMpdOutput()
    logger.debug("Restarting processes")
    await pm2.exec("restart", ["librespot"])
    return true
  }
}
