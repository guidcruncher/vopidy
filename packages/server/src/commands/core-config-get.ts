import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { Config } from "@/core/config"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  return Config.load()
}

export default execute
