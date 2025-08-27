import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { Spotify } from "@/services/spotify"
import { PagedItems, shimNonPaged } from "@/core/paging"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const spotifyClient = new Spotify()
  let res = await spotifyClient.getAlbum(message.params["id"])
  return shimNonPaged(res)
}

export default execute
