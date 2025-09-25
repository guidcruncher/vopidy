import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { db } from "@/services/db"
import { Spotify } from "@/services/spotify"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  if (message.params["source"] == "spotify") {
    const spotifyClient = new Spotify()
    return await spotifyClient.saveToLibrary(message.params["item"].id)
  }

  return await db.addBookmark(message.params["source"], message.params["item"])
}

export default execute
