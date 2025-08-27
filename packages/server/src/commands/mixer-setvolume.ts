import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { Mixer } from "@/services/mixer"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const volume = parseInt(message.params["level"])
  return await Mixer.setVolume(volume)
}

export default execute
