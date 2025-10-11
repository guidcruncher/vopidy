// stream.service.ts

import { PagedItems } from "@/core/paging"
import { WsClientStore } from "@/core/wsclientstore"
import { MediaPlayerService } from "./mediaplayerservice"
import { StreamRepository } from "./streamerrepository"

export class StreamService {
  private repository: StreamRepository
  private mediaPlayerService: MediaPlayerService

  constructor(repository: StreamRepository, mediaPlayerService: MediaPlayerService) {
    this.repository = repository
    this.mediaPlayerService = mediaPlayerService
  }

  /**
   * Searches for playlist items and returns them in a paginated view.
   */
  public async search(query: string, offset: number, limit: number): Promise<PagedItems<any>> {
    const items = await this.repository.searchPlaylistItems(query)

    // Business Logic for Paging
    const view = new PagedItems<any>()
    view.items = items
    view.offset = 0 // Assuming the 'db' find method returns all matches, not just a paged subset.
    view.limit = items.length
    view.total = items.length
    view.calculatePaging() // Calculates next/prev page links, etc.
    return view
  }

  /**
   * Retrieves and enriches the details of a stream item.
   */
  public async describe(id: string): Promise<any> {
    const item = await this.repository.getPlaylistItem(id)
    item.type = "stream" // Business Logic for enrichment
    return item
  }

  /**
   * Initiates playback for a stream item, updates history, and broadcasts the change.
   */
  public async play(id: string): Promise<any> {
    const item = await this.describe(id)

    // Coordinated Business Logic
    await this.repository.addToPlaybackHistory("stream", item)
    await this.mediaPlayerService.playUrl(item.url)
    this.mediaPlayerService.savePlaybackTrack("stream", id)

    // External System Interaction (WebSocket Broadcast)
    WsClientStore.broadcast({
      type: "track-changed",
      data: { uri: id, source: "stream" },
    })

    return item
  }
}
