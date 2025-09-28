import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { Mixer } from "@/services/mixer/"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  return Mixer.activeOutputDevice()
}

export default execute
