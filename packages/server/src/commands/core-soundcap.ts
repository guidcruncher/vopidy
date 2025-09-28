import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { Alsa } from "@/services/alsa/"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const alsa = new Alsa()
  let res: any = {}
  res = alsa.getCardInfo()
  // alsa.getSoundCap("")
  return res
}

export default execute
