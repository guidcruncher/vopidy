import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { SpotifyAuth } from "@/services/spotify/spotifyauth"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  return await SpotifyAuth.getProfile()
}

export default execute
