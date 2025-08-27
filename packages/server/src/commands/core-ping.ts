import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  return "pong"
}

export default execute
