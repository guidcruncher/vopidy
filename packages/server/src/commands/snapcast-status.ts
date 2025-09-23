import { JsonRpcClient } from "@/core/jsonrpcclient"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  return await JsonRpcClient.request("Server.GetStatus")
}

export default execute
