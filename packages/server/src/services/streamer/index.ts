import { logger } from "@/core/logger"
import { _fetchCache, _fetch, http } from "@/core/http"
import { getAccessTokenOnly } from "@/services/auth"
import { PagedItems } from "@/core/paging"
import { db } from "@/services/db"
import { Mpd } from "@/services/mpd"
import { Mixer } from "@/services/mixer"
import { WsClientStore } from "@/core/wsclientstore"

export class Streamer {
  public async search(query: string, offset: number, limit: number): Promise<PagedItems<any>> {
    let view = new PagedItems()
    let res = await db.findPlaylistItems(query)
    view.items = res
    view.offset = 0
    view.limit = res.length
    view.total = res.length
    view.calculatePaging()
    return view
  }

  public async describe(id: string) {
    let item: any = await db.getPlaylistItem(id)
    item.type = "stream"
    return item
  }

  public async playTrack(id: string) {
    const mpdClient = new Mpd()
    let item: any = await this.describe(id)
    await db.addToPlaybackHistory("stream", item)
    let res = await mpdClient.playTrackUrl(item.url)
    Mixer.savePlaybackTrack("stream", id)

    WsClientStore.broadcast({
      type: "track-changed",
      data: { uri: id, source: "stream" },
    })
    return item
  }
}
