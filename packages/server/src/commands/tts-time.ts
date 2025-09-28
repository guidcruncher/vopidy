import { Config } from "@/core/config"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { Tts } from "@/services/tts/"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const ttsClient = new Tts()
  let res = {}
  let date = Config.localDateString()
  let lang = message.params["lang"]
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

export default execute
