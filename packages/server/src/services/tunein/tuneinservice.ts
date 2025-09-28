// tunein-service.ts

import { PagedItems } from "@/core/paging"
import { WsClientStore } from "@/core/wsclientstore"
import { db } from "@/services/db/"
import { Mixer } from "@/services/mixer/"
import { TuneInApi } from "./tuneinapi"

export class TuneInService {
  private api: TuneInApi

  constructor(api: TuneInApi) {
    this.api = api
  }

  /**
   * Fetches and returns the top-level categories.
   */
  public async categories() {
    return this.api.getCategories()
  }

  /**
   * Browses a specific ID (category or list) and returns its contents.
   */
  public async browse(id: string) {
    return this.api.browse(id)
  }

  /**
   * Gets descriptive metadata for a station.
   */
  public async describe(id: string) {
    return this.api.describe(id)
  }

  /**
   * Handles the playback logic for a TuneIn station.
   */
  public async play(id: string) {
    // 1. Get descriptive metadata
    const item = await this.api.describe(id)
    if (!item) {
      return undefined
    }

    // 2. Get the stream URL
    const streamUrl = await this.api.getStreamUrl(id)
    if (!streamUrl) {
      return undefined
    }

    // 3. Start playback and update application state
    const mpdClient = Mixer.getMediaPlayer()
    Mixer.savePlaybackTrack("tunein", id)
    await mpdClient.play(streamUrl) // Use the retrieved stream URL

    // 4. Update playback history and broadcast
    db.addToPlaybackHistory("tunein", item)
    WsClientStore.broadcast({ type: "track-changed", data: item })

    return item
  }

  /**
   * Searches TuneIn for stations and returns paginated results.
   */
  public async search(query: string, offset: number, limit: number): Promise<PagedItems<any>> {
    const view = new PagedItems()
    view.query = query

    // 1. Fetch all search results
    const items = await this.api.search(query)

    // 2. Populate and paginate the view
    view.offset = 0 // The API returns all items, so local paging starts at 0
    view.items = items
    view.limit = view.items.length // Set limit to total items since all were fetched (or adjust for local paging if needed)
    view.total = view.items.length
    view.calculatePaging() // Calculates internal pagination state (which might be redundant if all items are returned)

    return view
  }
}
