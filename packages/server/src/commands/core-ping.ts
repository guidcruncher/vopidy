import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  return "pong"
}

export default execute
