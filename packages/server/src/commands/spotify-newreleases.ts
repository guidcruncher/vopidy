import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { SpotifyCatalog } from "@/services/spotify/spotifycatalog"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const spotifyClient = new SpotifyCatalog()
  return await spotifyClient.getNewAlbums()
}

export default execute
