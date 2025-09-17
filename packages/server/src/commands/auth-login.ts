import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { Auth } from "@/services/auth"
import { Spotify } from "@/services/spotify"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const authClient = new Auth()
  const spotifyClient = new Spotify()
  const res = await authClient.login(message.params["id"])
  await spotifyClient.login()
  return res
}

export default execute
