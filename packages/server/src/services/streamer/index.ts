// streamer.facade.ts

import { PagedItems } from "@/core/paging"

// --- Import the Refactored Classes (Assuming they are available) ---
import { MediaPlayerService } from "./mediaplayerservice"
import { StreamRepository } from "./streamerrepository"
import { StreamService } from "./streamservice"

/**
 * The StreamerFacade provides a simplified, clean interface to the complex
 * Stream subsystem (StreamService, StreamRepository, MediaPlayerService).
 * * It mirrors the original Streamer class's public methods but handles
 * the instantiation and wiring of all underlying dependencies internally.
 */
export class Streamer {
  private streamService: StreamService

  constructor() {
    // 1. Instantiate low-level dependencies
    const repository = new StreamRepository()
    const mediaPlayerService = new MediaPlayerService()

    // 2. Instantiate the core business logic service with its dependencies
    this.streamService = new StreamService(repository, mediaPlayerService)
  }

  /**
   * Searches for playlist items.
   */
  public async search(query: string, offset: number, limit: number): Promise<PagedItems<any>> {
    return this.streamService.search(query, offset, limit)
  }

  /**
   * Retrieves and enriches the details of a stream item.
   */
  public async describe(id: string): Promise<any> {
    return this.streamService.describe(id)
  }

  /**
   * Initiates playback for a stream item, updates history, and broadcasts the change.
   */
  public async play(id: string): Promise<any> {
    return this.streamService.play(id)
  }
}
