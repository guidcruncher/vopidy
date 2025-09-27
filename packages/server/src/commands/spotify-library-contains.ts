import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { SpotifyUserLibrary } from "@/services/spotify/spotifyuserlibrary"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const spotifyClient = new SpotifyUserLibrary()
  let res = await spotifyClient.inLibrary(message.params["id"])
  return { id: message.params["id"], exists: res }
}

export default execute
