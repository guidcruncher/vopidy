import { RpcService, ServiceModule } from "@/core/jsonrpc/types"
import { Auth } from "@/services/auth"
import { RadioBrowser } from "@/services/radiobrowser"
import { Spotify } from "@/services/spotify"
import { SpotifyFinder } from "@/services/spotify/finder"
import { Streamer } from "@/services/streamer"
import { TuneIn } from "@/services/tunein"

class SearchService implements RpcService {
  public async search(catalog: string, query: string, offset: number, limit: number) {
    const spotifyClient = new Spotify()
    const tuneInClient = new TuneIn()
    const radioBrowserClient = new RadioBrowser()
    const streamClient = new Streamer()
    const spotifyFinder = new SpotifyFinder()

    const catalogIdent = catalog.split(":")

    switch (catalogIdent[0]) {
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
        return spotifyFinder.keyword(catalogIdent[1], query, offset, limit, market)
    }
  }
}

export const namespace = "search"
export const service = new SearchService()

const module: ServiceModule = { namespace, service }
export default module
