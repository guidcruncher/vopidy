import { Config } from "@/core/config"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { tts } from "@/services/tts"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const ttsClient = new tts()
  let res = {}
  let date = Config.localDateString()
  await ttsClient.speak(message.params["lang"], date)
  return date
}

export default execute
