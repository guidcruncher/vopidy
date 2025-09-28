import { Config } from "@/core/config"
import { RpcService, ServiceModule } from "@/core/jsonrpc/types"
import { Tts } from "@/services/tts/"

class TtsService implements RpcService {
  public async speak(lang: string, text: string) {
    const ttsClient = new Tts()
    let res = {}

    return await ttsClient.speak(lang, text)
  }

  public async time(lang: string) {
    const ttsClient = new Tts()
    let res = {}
    let date = Config.localDateString()
    const config = Config.load()

    if (config.nightEndHour && config.nightEndHour == Config.localDate().getHours()) {
      await ttsClient.speak(lang, `Good Morning, It's ${date}`)
    } else {
      if (config.nightStartHour && config.nightStartHour == Config.localDate().getHours()) {
        await ttsClient.speak(lang, `It's ${date}, Good night.`)
      } else {
        if (Config.localDate().getHours() == 12) {
          await ttsClient.speak(lang, `Good afternoon, It's ${date}`)
        } else {
          await ttsClient.speak(lang, `It's ${date}`)
        }
      }
    }

    return date
  }
}

export const namespace = "tts"
export const service = new TtsService()

const module: ServiceModule = { namespace, service }
export default module
