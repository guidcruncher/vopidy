import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { M3uFile } from "@/services/m3ufile"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  if (message.params.length == 0) {
    return []
  }

  if (message.params["url"]) {
    return await M3uFile.fromUrl(message.params["url"])
  }

  if (message.params["text"]) {
    return M3uFile.fromString(message.params["text"])
  }

  return []
}

export default execute
