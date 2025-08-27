import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { db } from "@/services/db"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  return await db.getPlaylistItem(message.params["id"])
}

export default execute
