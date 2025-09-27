import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { SpotifyCatalog } from "@/services/spotify/spotifycatalog"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const spotifyClient = new SpotifyCatalog()

  if (message.params.length == 0) {
    return []
  }

  return await spotifyClient.describe(message.params["id"])
}

export default execute
