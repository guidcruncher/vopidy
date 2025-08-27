import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { Auth } from "@/services/auth"
import { Spotify } from "@/services/spotify"
import { RadioBrowser } from "@/services/radiobrowser"
import { TuneIn } from "@/services/tunein"
import { LocalMusic } from "@/services/localmusic"
import { Streamer } from "@/services/streamer"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const spotifyClient = new Spotify()
  const tuneInClient = new TuneIn()
  const radioBrowserClient = new RadioBrowser()
  const streamClient = new Streamer()

  const catalog = message.params["catalog"].split(":")
  const query = message.params["query"]
  const offset = message.params["offset"]
  const limit = message.params["limit"]

  switch (catalog[0]) {
    case "tunein":
      return await tuneInClient.search(query, offset, limit)
      break
    case "stream":
      return await streamClient.search(query, offset, limit)
      break
    case "radiobrowser":
      return await radioBrowserClient.search(query, offset, limit)

    case "spotify":
      const market = Auth.getProfile().market
      return await spotifyClient.search(catalog[1], query, offset, limit, market)
  }
}

export default execute
