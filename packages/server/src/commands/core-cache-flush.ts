import { CacheManager } from "@/core/cachemanager"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  return await CacheManager.flush()
}

export default execute
