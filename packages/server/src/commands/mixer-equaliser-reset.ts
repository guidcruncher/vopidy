import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { Mixer } from "@/services/mixer"
import { Equaliser } from "@/services/equaliser"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const equal = new Equaliser()
  return await equal.resetMixer(message.params["value"])
}

export default execute
