import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { SpotifyUserLibrary } from "@/services/spotify/spotifyuserlibrary"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const spotifyClient = new SpotifyUserLibrary()
  let res = await spotifyClient.doesFollow(message.params["type"], message.params["id"])
  return { id: message.params["id"], following: res }
}

export default execute
