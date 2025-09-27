import { PagedItems } from "@/core/paging"
import { WsClientStore } from "@/core/wsclientstore"
import { db } from "@/services/db"
import { Mixer } from "@/services/mixer"

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

  public async play(id: string) {
    const mpdClient = Mixer.getMediaPlayer()
    let item: any = await this.describe(id)
    await db.addToPlaybackHistory("stream", item)
    let res = await mpdClient.play(item.url)
    Mixer.savePlaybackTrack("stream", id)

    WsClientStore.broadcast({
      type: "track-changed",
      data: { uri: id, source: "stream" },
    })
    return item
  }
}
