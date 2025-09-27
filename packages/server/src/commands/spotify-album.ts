import { shimNonPaged } from "@/core/paging"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { SpotifyCatalog } from "@/services/spotify/spotifycatalog"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const spotifyClient = new SpotifyCatalog()
  let res = await spotifyClient.getAlbum(message.params["id"])
  return shimNonPaged(res)
}

export default execute
