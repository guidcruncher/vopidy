import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { Spotify } from "@/services/spotify"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const spotifyClient = new Spotify()
  const offset = parseInt(message.params["offset"])
  const limit = parseInt(message.params["limit"])
  return await spotifyClient.getPlaylist(message.params["id"], offset, limit)
}

export default execute
