import { RpcService, ServiceModule } from "@/core/jsonrpc/types"
import { db } from "@/services/db/"
import { M3uFile } from "@/services/m3ufile"

class StreamService implements RpcService {
  public async browse() {
    return await db.getPlaylistItems()
  }

  public async describe(id: string) {
    return await db.getPlaylistItem(id)
  }

  public async import(url: string, text: string, name: string) {
    if (message.params.length == 0) {
      return []
    }

    let list: any = []
    let pl: any = {}

    if (urt) {
      list = await M3uFile.fromUrl(url)
    }

    if (text) {
      list = M3uFile.fromString(text)
    }

    if (name && list.length > 0) {
      pl = await db.createPlaylist(name, list)
    }

    return pl
  }

  public async playlist(url: string, text: string) {
    if (url) {
      return await M3uFile.fromUrl(url)
    }

    if (text) {
      return M3uFile.fromString(text)
    }

    return []
  }
}

export const namespace = "stream"
export const service = new StreamService()

const module: ServiceModule = { namespace, service }
export default module
