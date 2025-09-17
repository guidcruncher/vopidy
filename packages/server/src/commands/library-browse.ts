import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { LocalMusic } from "@/services/localmusic"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const client = new LocalMusic()

  if (message.params.length == 0) {
    return []
  }

  return await client.browse(message.params["dir"])
}

export default execute
