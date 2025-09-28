import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { Mixer } from "@/services/mixer/"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  let state = await Mixer.stop()
  return await Mixer.getStatus()
}

export default execute
