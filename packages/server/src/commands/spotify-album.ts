import { shimNonPaged } from "@/core/paging"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { Spotify } from "@/services/spotify"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const spotifyClient = new Spotify()
  let res = await spotifyClient.getAlbum(message.params["id"])
  return shimNonPaged(res)
}

export default execute
