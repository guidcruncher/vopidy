// playbackHistoryService.ts
import { DatabaseManager } from "./databasemanager"

// Simple type definition for history item
type HistoryItem = {
  id?: string
  name?: string
  image?: string
  album?: string
  artist?: any // Could be string or array of objects
  type?: string
}

/**
 * Handles operations related to the playback history.
 */
export class PlaybackHistoryService {
  /**
   * Adds an item to the playback history.
   */
  public static async addToPlaybackHistory(source: string, item: HistoryItem): Promise<void> {
    if (!item.id || !item.name || item.name === "") {
      return
    }

    const dbc = await DatabaseManager.getDb()

    // Logic to format artist name
    const artist = item.artist
      ? Array.isArray(item.artist)
        ? item.artist.map((t: any) => t.name).join(", ")
        : item.artist
      : ""

    try {
      await dbc.run(
        `INSERT INTO playback_history (source, uri, image, album, name, artist, type) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        source,
        item.id,
        item.image ?? "",
        item.album ?? "",
        item.name ?? "",
        artist,
        item.type,
      )
    } finally {
      await dbc.close()
    }
  }

  /**
   * Gets the playback history aggregated by popularity (total plays).
   */
  public static async getPlaybackHistoryPop(): Promise<any[]> {
    const dbc = await DatabaseManager.getDb()
    try {
      return await dbc.all(
        `SELECT COUNT(uri) as total, source, uri, image, name, artist, type FROM (
         SELECT DISTINCT unixepoch(strftime('%F %H:%M:00' ,created)) AS created,
         uri,source, uri, image, name, artist, type FROM playback_history)
         GROUP BY source, uri ORDER BY total DESC;`,
      )
    } finally {
      await dbc.close()
    }
  }

  /**
   * Gets the full, time-stamped playback history.
   */
  public static async getPlaybackHistory(): Promise<any[]> {
    const dbc = await DatabaseManager.getDb()
    try {
      return await dbc.all(
        `SELECT source, uri, image, album, name, artist, type, COUNT(uri) AS popularity, 
         unixepoch(strftime('%F %H:%M:00' ,created)) AS lastplayed FROM playback_history 
         GROUP BY source, uri, lastplayed ORDER BY lastplayed DESC`,
      )
    } finally {
      await dbc.close()
    }
  }
}
