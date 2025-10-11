// playlistService.ts
import { DatabaseManager, DbInstance } from "./databasemanager"
import { UtilityService } from "./utils"

// Simple type definition for playlist item
type PlaylistItem = {
  name: string
  url: string
  image?: string
}

/**
 * Handles operations related to user playlists.
 */
export class PlaylistService {
  /**
   * Creates a new playlist with associated items.
   */
  public static async createPlaylist(name: string, items: PlaylistItem[]): Promise<any> {
    const playlistUri = UtilityService.newUri()
    const dbc = await DatabaseManager.getDb()

    try {
      // 1. Insert the playlist
      await dbc.run("INSERT INTO playlist (uri, name) VALUES (?, ?)", playlistUri, name)

      // 2. Insert playlist items
      // Using Promise.all for parallel insertion for better performance
      const itemInsertPromises = items.map((item) =>
        dbc.run(
          "INSERT INTO playlist_items (uri, playlist, name, url, image) VALUES (?, ?, ?, ?, ?)",
          UtilityService.newUri(),
          playlistUri,
          item.name,
          item.url,
          item.image,
        ),
      )
      await Promise.all(itemInsertPromises)

      // 3. Return the newly created playlist
      return await this.getPlaylist(playlistUri, dbc)
    } finally {
      await dbc.close()
    }
  }

  /**
   * Retrieves all playlists.
   */
  public static async getPlaylists(): Promise<any[]> {
    const dbc = await DatabaseManager.getDb()
    try {
      return await dbc.all("SELECT uri AS id, name FROM playlist ORDER BY name ASC")
    } finally {
      await dbc.close()
    }
  }

  /**
   * Retrieves all items from all playlists.
   */
  public static async getPlaylistItems(): Promise<any[]> {
    const dbc = await DatabaseManager.getDb()
    try {
      return await dbc.all(
        "SELECT uri AS id, name, url, image FROM playlist_items ORDER BY name ASC",
      )
    } finally {
      await dbc.close()
    }
  }

  /**
   * Retrieves a single playlist item by its ID.
   */
  public static async getPlaylistItem(id: string): Promise<any> {
    const dbc = await DatabaseManager.getDb()
    try {
      return await dbc.get(
        "SELECT uri AS id, name, url, image FROM playlist_items WHERE uri = ? ",
        id,
      )
    } finally {
      await dbc.close()
    }
  }

  /**
   * Retrieves a single playlist and its associated items.
   */
  public static async getPlaylist(id: string, existingDbc?: DbInstance): Promise<any> {
    const dbc = existingDbc || (await DatabaseManager.getDb())
    try {
      let res = await dbc.get("SELECT uri AS id, name FROM playlist WHERE uri = ?", id)

      if (res) {
        res.items = await dbc.all(
          "SELECT uri AS id, name, url, image FROM playlist_items WHERE playlist = ? ORDER BY name ASC",
          id,
        )
      }
      return res
    } finally {
      if (!existingDbc) {
        await dbc.close()
      }
    }
  }

  /**
   * Finds playlist items whose name matches the query.
   */
  public static async findPlaylistItems(query: string): Promise<any[]> {
    const dbc = await DatabaseManager.getDb()
    try {
      // Replace '*' with '%' for SQL LIKE query pattern matching
      const sqlquery = query.replaceAll("*", "%")
      return await dbc.all(
        // Assuming LIKE is an alias for the sqlite LIKE function
        "SELECT uri AS id, name, url, image, 'stream' as type FROM playlist_items WHERE name LIKE ? ORDER BY name ASC",
        sqlquery,
      )
    } finally {
      await dbc.close()
    }
  }
}
