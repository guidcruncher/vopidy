import { RpcService, ServiceModule } from "@/core/jsonrpc/types"
import { db } from "@/services/db/"
import { SpotifyUserLibrary } from "@/services/spotify/spotifyuserlibrary"

class BookmarksService implements RpcService {
  public async browse() {
    return db.getBookmarks()
  }

  public async create(source: string, item: any) {
    if (source.toLowerCase() == "spotify") {
      const spotifyClient = new SpotifyUserLibrary()
      return spotifyClient.saveToLibrary(item.id)
    }

    return db.addBookmark(source, item)
  }

  public async delete(source: string, id: string) {
    return db.deleteBookmark(source, id)
  }
}

export const namespace = "bookmarks"
export const service = new BookmarksService()

const module: ServiceModule = { namespace, service }
export default module
