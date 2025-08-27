import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { Spotify } from "@/services/spotify"
import { PagedItems, shimNonPaged } from "@/core/paging"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const spotifyClient = new Spotify()
  const offset = parseInt(message.params["offset"])
  const limit = parseInt(message.params["limit"])
  const res = await spotifyClient.getShow(message.params["id"], offset, limit)
  return res
}

export default execute
