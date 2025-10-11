// bookmarkService.ts
import { DatabaseManager, DbInstance } from "./databasemanager"

// Simple type definition for bookmark item
type BookmarkItem = {
  id: string
  name: string
  image?: string
}

/**
 * Handles operations related to user bookmarks.
 */
export class BookmarkService {
  /**
   * Retrieves a single bookmark.
   */
  private static async getBookmark(
    source: string,
    item: BookmarkItem,
    dbc: DbInstance,
  ): Promise<any> {
    // This is a helper, so it uses the passed-in connection and doesn't close it
    return await dbc.get(
      "SELECT source AS source, uri AS id, name, image FROM  bookmarks WHERE source = ? AND uri = ?",
      source,
      item.id,
    )
  }

  /**
   * Adds a new bookmark or returns the existing one.
   */
  public static async addBookmark(source: string, item: BookmarkItem): Promise<any> {
    const dbc = await DatabaseManager.getDb()
    try {
      const rec = await this.getBookmark(source, item, dbc)
      if (rec) {
        return rec
      }

      await dbc.run(
        "INSERT INTO bookmarks (source, uri, name ,image) VALUES (?, ?, ?, ?)",
        source,
        item.id,
        item.name,
        item.image,
      )
      // Return the newly inserted bookmark
      return await this.getBookmark(source, item, dbc)
    } finally {
      await dbc.close()
    }
  }

  /**
   * Deletes a bookmark by source and ID.
   */
  public static async deleteBookmark(source: string, id: string): Promise<any[]> {
    const dbc = await DatabaseManager.getDb()
    try {
      await dbc.run("DELETE FROM bookmarks WHERE source = ? AND uri = ?", source, id)
      // Return the updated list of bookmarks
      return await this.getBookmarks(dbc)
    } finally {
      await dbc.close()
    }
  }

  /**
   * Retrieves all bookmarks.
   */
  public static async getBookmarks(existingDbc?: DbInstance): Promise<any[]> {
    const dbc = existingDbc || (await DatabaseManager.getDb())
    try {
      return await dbc.all(
        "SELECT source AS source, uri AS id, name, image FROM  bookmarks ORDER BY name ASC",
      )
    } finally {
      // Only close the connection if we opened it in this method
      if (!existingDbc) {
        await dbc.close()
      }
    }
  }
}
