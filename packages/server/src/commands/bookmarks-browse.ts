import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { db } from "@/services/db"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  return await db.getBookmarks()
}

export default execute
