import * as googleTTS from "google-tts-api"
import * as cp from "child_process"

export class tts {
  async play(buffer: Buffer) {
    const child = cp.spawn("/usr/bin/pacat -p -d alsa-sink")
    //    child.stdin.setEncoding("utf-8")
    child.stdin.write(buffer.toString("utf8"))
    child.stdin.end()
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
          await this.play(Buffer.from(res, "base64"))
          resolve(true)
        })
        .catch((err) => {
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
          await this.play(
            data.reduce((item) => {
              return Buffer.from(item, "base64")
            }),
          )
          resolve(true)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
}
