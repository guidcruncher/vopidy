import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { M3uFile } from "@/services/m3ufile"
import { db } from "@/services/db"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  return await db.addBookmark(message.params["source"], message.params["item"])
}

export default execute
