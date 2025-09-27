import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { Auth } from "@/services/auth"
import { SpotifyAuth } from "@/services/spotify/spotifyauth"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const authClient = new Auth()
  const res = await authClient.login(message.params["id"])
  await SpotifyAuth.login()
  return res
}

export default execute
