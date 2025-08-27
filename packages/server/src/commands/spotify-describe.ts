import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { Spotify } from "@/services/spotify"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const spotifyClient = new Spotify()

  if (message.params.length == 0) {
    return []
  }

  return await spotifyClient.describe(message.params["id"])
}

export default execute
