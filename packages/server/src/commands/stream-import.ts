import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { M3uFile } from "@/services/m3ufile"
import { db } from "@/services/db"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  if (message.params.length == 0) {
    return []
  }

  let list: any = []
  let pl: any = {}

  if (message.params["url"]) {
    list = await M3uFile.fromUrl(message.params["url"])
  }

  if (message.params["text"]) {
    list = M3uFile.fromString(message.params["text"])
  }

  if (message.params["name"] && list.length > 0) {
    pl = await db.createPlaylist(message.params["name"], list)
  }

  return pl
}

export default execute
