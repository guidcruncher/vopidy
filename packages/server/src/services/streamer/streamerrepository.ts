
import { db } from "@/services/db"

/**
 * Handles all data access operations for Stream-related items (PlaylistItems).
 */
export class StreamRepository {
  /**
   * Finds playlist items that match a given query.
   * @param query The search term.
   * @returns A promise that resolves to an array of playlist items.
   */
  public async searchPlaylistItems(query: string): Promise<any[]> {
    return db.findPlaylistItems(query)
  }

  /**
   * Retrieves a single playlist item by its ID.
   * @param id The ID of the playlist item.
   * @returns A promise that resolves to the playlist item object.
   */
  public async getPlaylistItem(id: string): Promise<any> {
    return db.getPlaylistItem(id)
  }

  /**
   * Adds an item to the playback history.
   * @param type The type of the item (e.g., "stream").
   * @param item The item object to add to history.
   */
  public async addToPlaybackHistory(type: string, item: any): Promise<void> {
    await db.addToPlaybackHistory(type, item)
  }
}
