import { JsonRpcClient } from "@/core/jsonrpcclient"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  return await JsonRpcClient.request("Client.SetVolume", {
    id: message.params["id"],
    volume: { muted: message.params["muted"], percent: message.params["level"] },
  })
}

export default execute
