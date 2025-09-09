import { Mixer } from "@/services/mixer"
import { logger } from "@/core/logger"
import * as googleTTS from "google-tts-api"
import child_process from "node:child_process"
import { StringDecoder } from "node:string_decoder"
import { Buffer } from "node:buffer"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import * as crypto from "crypto"
import { Pulseaudio } from "@/services/pulseaudio"
import { promisify } from "node:util"
const execFile = promisify(child_process.execFile)

export class tts {
  private async downloadPart(url: string) {
    try {
      const res = await fetch(url)

      if (res.ok) {
        return await res.bytes()
      }

      return []
    } catch (err) {
      return []
    }
  }

  async play(buffer: Buffer) {
    const pulseAudioClient = new Pulseaudio()
    let volume = await pulseAudioClient.getVolumeLinear()
    const state = await Mixer.getStatus()

    if (state && state.playing) {
      volume += 15000
      if (volume > 65535) {
        volume = 65535
      }
    }

    return new Promise(async (resolve, reject) => {
      const filename = path.join(os.tmpdir(), `${crypto.randomBytes(16).toString("hex")}.mp3`)
      try {
        fs.writeFileSync(filename, buffer, { encoding: "base64" })
        execFile("/usr/bin/paplay", [`--volume=${volume}`, `${filename}`]).then(() => {
          fs.unlinkSync(filename)
          resolve(true)
        })
      } catch (err) {
        logger.error("Error playing TTS", err)
        if (fs.existsSync(filename)) {
          fs.unlinkSync(filename)
        }
        reject()
      }
    })
  }

  async speak(lang: string, text: string) {
    if (text.length < 200) {
      return await this.speakShort(lang, text)
    } else {
      return await this.speakLong(lang, text)
    }
  }

  async speakShort(lang: string, text: string) {
    return new Promise<boolean>((resolve, reject) => {
      googleTTS
        .getAudioBase64(text, {
          lang: lang,
          slow: false,
          host: "https://translate.google.com",
          timeout: 10000,
        })
        .then(async (res) => {
          this.play(Buffer.from(res, "base64"))
          resolve(true)
        })
        .catch((err) => {
          logger.error("Error in getAudioBase64", err)
          reject(err)
        })
    })
  }

  async speakLong(lang: string, text: string) {
    return new Promise<boolean>((resolve, reject) => {
      googleTTS
        .getAllAudioBase64(text, {
          lang: lang,
          slow: false,
          host: "https://translate.google.com",
          timeout: 10000,
        })
        .then(async (data) => {
          if (data) {
            this.play(
              Buffer.concat(
                data.map((item) => {
                  return Buffer.from(item.base64, "base64")
                }),
              ),
            )
          }
          resolve(true)
        })
        .catch((err) => {
          logger.error("Error in getAllAudioBase64", err)
          reject(err)
        })
    })
  }
}
