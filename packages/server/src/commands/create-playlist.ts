import { CacheManager } from "@/core/cachemanager"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { Spotify } from "@/services/spotify"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const spotifyClient = new Spotify()
  let res = await spotifyClient.createPlaylist(message.params["name"], message.params["uris"])
  await CacheManager.flush()
  return res
}

export default execute
