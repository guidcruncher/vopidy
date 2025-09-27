import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { SpotifyLibrary } from "@/services/spotify/spotifylibrary"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const spotifyClient = new SpotifyLibrary()
  const offset = parseInt(message.params["offset"])
  const limit = parseInt(message.params["limit"])
  return await spotifyClient.getPlaylist(message.params["id"], offset, limit)
}

export default execute
