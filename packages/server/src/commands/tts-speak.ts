import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { Tts } from "@/services/tts/"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const ttsClient = new Tts()
  let res = {}

  return await ttsClient.speak(message.params["lang"], message.params["text"])
}

export default execute
