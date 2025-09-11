import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { Auth } from "@/services/auth"
import { RadioBrowser } from "@/services/radiobrowser"
import { Spotify } from "@/services/spotify"
import { SpotifyFinder } from "@/services/spotify/finder"
import { Streamer } from "@/services/streamer"
import { TuneIn } from "@/services/tunein"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const spotifyClient = new Spotify()
  const tuneInClient = new TuneIn()
  const radioBrowserClient = new RadioBrowser()
  const streamClient = new Streamer()
  const spotifyFinder = new SpotifyFinder()

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
      return await spotifyFinder.keyword(catalog[1], query, offset, limit, market)
  }
}

export default execute
