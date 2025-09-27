import { CacheManager } from "@/core/cachemanager"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { SpotifyCatalog } from "@/services/spotify/spotifycatalog"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const spotifyClient = new SpotifyCatalog()
  let res = await spotifyClient.createPlaylist(message.params["name"], message.params["uris"])
  await CacheManager.flush()
  return res
}

export default execute
