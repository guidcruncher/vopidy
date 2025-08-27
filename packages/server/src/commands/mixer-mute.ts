import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { Mixer } from "@/services/mixer"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  return await Mixer.mute()
}

export default execute
