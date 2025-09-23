import { JsonRpcClient } from "@/core/jsonrpcclient"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  if (!message.params["level"]) {
    return await JsonRpcClient.request("Client.SetVolume", {
      id: message.params["id"],
      volume: { muted: message.params["muted"] },
    })
  } else {
    return await JsonRpcClient.request("Client.SetVolume", {
      id: message.params["id"],
      volume: { percent: message.params["level"] },
    })
  }
}

export default execute
