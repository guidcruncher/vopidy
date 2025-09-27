import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { SpotifyLibrary } from "@/services/spotify/spotifylibrary"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const spotifyClient = new SpotifyLibrary()
  return await spotifyClient.getTracks()
}

export default execute
