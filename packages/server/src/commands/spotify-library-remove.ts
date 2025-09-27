import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { SpotifyUserLibrary } from "@/services/spotify/spotifyuserlibrary"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const spotifyClient = new SpotifyUserLibrary()
  let res = await spotifyClient.removeFromLibrary(message.params["id"])
  return res
}

export default execute
