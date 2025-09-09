import { logger } from "@/core/logger"
import * as googleTTS from "google-tts-api"
import * as cp from "child_process"
import { StringDecoder } from "node:string_decoder"
import { Buffer } from "node:buffer"

export class tts {
  play(buffer: Buffer) {
    try {
      const child = cp.spawn("/usr/bin/ffplay -  ")
      const decoder = new StringDecoder("utf8")
      child.stdin.write(decoder.end(buffer))

      child.stderr.on("data", function (data) {
        logger.warn("play => " + data)
      })

      child.stdout.on("data", function (data) {
        logger.trace("play => " + data)
      })

      child.stdin.end()
      return true
    } catch (err) {
      logger.error("Error playing TTS", err)
      return false
    }
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
        .then((res) => {
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
        .then((data) => {
          this.play(
            Buffer.concat(
              data.map((item) => {
                return Buffer.from(item.base64, "base64")
              }),
            ),
          )
          resolve(true)
        })
        .catch((err) => {
          logger.error("Error in getAllAudioBase64", err)
          reject(err)
        })
    })
  }
}
