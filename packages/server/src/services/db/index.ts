import { BookmarkService } from "./bookmarkservice"
import { PlaybackHistoryService } from "./playbackhistoryservice"
import { PlaylistService } from "./playlistservice"
import { UtilityService } from "./utils"

// Define simplified types used by the facade
type HistoryItem = Parameters<typeof PlaybackHistoryService.addToPlaybackHistory>[1]
type BookmarkItem = Parameters<typeof BookmarkService.addBookmark>[1]
type PlaylistItem = Parameters<typeof PlaylistService.createPlaylist>[1][0]

/**
 * DatabaseFacade
 * * Provides a simplified, unified interface to all the underlying
 * database service classes (PlaybackHistory, Bookmarks, Playlists).
 * It hides the complexity of managing multiple service classes from the application layer.
 */
export class db {
  // --- Utility Methods ---

  /**
   * Generates a new unique URI.
   * @returns A new unique URI string.
   */
  public static newUri(): string {
    return UtilityService.newUri()
  }

  // -------------------------
  // --- Playback History ---
  // -------------------------

  /**
   * Adds an item to the playback history.
   */
  public static async addToPlaybackHistory(source: string, item: HistoryItem): Promise<void> {
    return PlaybackHistoryService.addToPlaybackHistory(source, item)
  }

  /**
   * Gets the playback history aggregated by popularity.
   */
  public static async getPlaybackHistoryPop(): Promise<any[]> {
    return PlaybackHistoryService.getPlaybackHistoryPop()
  }

  /**
   * Gets the full, time-stamped playback history.
   */
  public static async getPlaybackHistory(): Promise<any[]> {
    return PlaybackHistoryService.getPlaybackHistory()
  }

  // --------------------
  // --- Bookmarks ---
  // --------------------

  /**
   * Adds a new bookmark or returns the existing one.
   */
  public static async addBookmark(source: string, item: BookmarkItem): Promise<any> {
    return BookmarkService.addBookmark(source, item)
  }

  /**
   * Deletes a bookmark by source and ID.
   */
  public static async deleteBookmark(source: string, id: string): Promise<any[]> {
    return BookmarkService.deleteBookmark(source, id)
  }

  /**
   * Retrieves all bookmarks.
   */
  public static async getBookmarks(): Promise<any[]> {
    return BookmarkService.getBookmarks()
  }

  // --------------------
  // --- Playlists ---
  // --------------------

  /**
   * Creates a new playlist with associated items.
   */
  public static async createPlaylist(name: string, items: PlaylistItem[]): Promise<any> {
    return PlaylistService.createPlaylist(name, items)
  }

  /**
   * Retrieves all playlists.
   */
  public static async getPlaylists(): Promise<any[]> {
    return PlaylistService.getPlaylists()
  }

  /**
   * Retrieves a single playlist and its associated items.
   */
  public static async getPlaylist(id: string): Promise<any> {
    // Note: The PlaylistService handles getting both playlist metadata and items.
    return PlaylistService.getPlaylist(id)
  }

  public static async getPlaylistItem(id: string): Promise<any> {
    return PlaylistService.getPlaylistItem(id)
  }

  public static async getPlaylistItems(): Promise<any> {
    return PlaylistService.getPlaylistItems()
  }
  /**
   * Finds playlist items whose name matches the query.
   */
  public static async findPlaylistItems(query: string): Promise<any[]> {
    return PlaylistService.findPlaylistItems(query)
  }
}
