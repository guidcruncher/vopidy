import * as crypto from "crypto"
import { open } from "sqlite"
import sqlite3 from "sqlite3"

export class db {
  public static async getDb() {
    return open({ filename: `${process.env.VOPIDY_DB}/vopidy.sqlite`, driver: sqlite3.Database })
  }

  public static newUri() {
    const id = crypto.randomBytes(16).toString("hex")
    return crypto.createHash("sha256").update(id).digest("base64url")
  }

  public static async addToPlaybackHistory(source, item) {
    if (!item.id || !item.name || item.name == "") {
      return
    }
    const dbc = await db.getDb()
    const artist = item.artist
      ? Array.isArray(item.artist)
        ? item.artist.map((t) => t.name).join(", ")
        : item.artist
      : ""
    await dbc.run(
      `INSERT INTO playback_history (source, uri, image, album, name, artist, type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      source,
      item.id,
      item.image ?? "",
      item.album ?? "",
      item.name ?? "",
      artist,
      item.type,
    )
    await dbc.close()
  }

  public static async getPlaybackHistoryPop() {
    const dbc = await db.getDb()
    let res: any[] = await dbc.all(
      `SELECT count(uri) as total, source, uri, image, name, artist, type from playback_history group by source, uri, image, name, artist, type ORDER BY total DESC;`,
    )
    await dbc.close()
    return res
  }

  public static async getPlaybackHistory() {
    const dbc = await db.getDb()
    let res: any[] = await dbc.all(
      `SELECT source, uri, image, album, name, artist, type, COUNT(uri) AS popularity, MAX(created) AS lastplayed  FROM playback_history 
       GROUP BY source, uri, image, album, name, artist, type ORDER BY lastplayed DESC`,
    )
    await dbc.close()
    return res
  }

  private static async getBookmark(source, item) {
    const dbc = await db.getDb()
    let res = await dbc.get(
      "SELECT source AS source, uri AS id, name, image FROM  bookmarks WHERE source = ? AND uri = ?",
      source,
      item.id,
    )
    await dbc.close()
    return res
  }

  public static async addBookmark(source, item) {
    const rec = await db.getBookmark(source, item)
    if (rec) {
      return rec
    }
    const dbc = await db.getDb()
    await dbc.run(
      "INSERT INTO bookmarks (source, uri, name ,image) VALUES (?, ?, ?, ?)",
      source,
      item.id,
      item.name,
      item.image,
    )
    await dbc.close()
    return await db.getBookmark(source, item)
  }

  public static async getBookmarks() {
    const dbc = await db.getDb()
    let res = await dbc.all(
      "SELECT source AS source, uri AS id, name, image FROM  bookmarks ORDER BY name ASC",
    )
    await dbc.close()
    return res
  }

  public static async createPlaylist(name: string, items: any[]) {
    //ELECT last_insert_rowid() AS playlistid
    const playlist = db.newUri()
    const dbc = await db.getDb()
    await dbc.run("INSERT INTO playlist (uri, name) VALUES (?, ?)", playlist, name)

    items.forEach(async (item) => {
      await dbc.run(
        "INSERT INTO playlist_items (uri, playlist, name, url, image) VALUES (?, ?, ?, ?, ?)",
        db.newUri(),
        playlist,
        item.name,
        item.url,
        item.image,
      )
    })

    await dbc.close()
    return await db.getPlaylist(playlist)
  }

  public static async getPlaylists() {
    const dbc = await db.getDb()
    let res = await dbc.all("SELECT uri AS id, name FROM playlist ORDER BY name ASC")
    await dbc.close()
    return res
  }

  public static async getPlaylistItems() {
    const dbc = await db.getDb()
    let res = await dbc.all(
      "SELECT uri AS id, name, url, image FROM playlist_items ORDER BY name ASC",
    )
    await dbc.close()
    return res
  }

  public static async getPlaylistItem(id: string) {
    const dbc = await db.getDb()
    let res = await dbc.get(
      "SELECT uri AS id, name, url, image FROM playlist_items WHERE uri = ? ",
      id,
    )
    await dbc.close()
    return res
  }

  public static async getPlaylist(id: string) {
    //ELECT last_insert_rowid() AS playlistid
    const dbc = await db.getDb()
    let res = await dbc.get("SELECT uri AS id, name FROM playlist WHERE uri = ?", id)

    res.items = await dbc.all(
      "SELECT uri AS id, name, url, image FROM playlist_items WHERE playlist = ? ORDER BY name ASC",
      id,
    )

    await dbc.close()
    return res
  }

  public static async findPlaylistItems(query: string) {
    const dbc = await db.getDb()
    const sqlquery = query.replaceAll("*", "%")
    let res = await dbc.all(
      "SELECT uri AS id, name, url, image, 'stream' as type FROM playlist_items WHERE LIKE( ?, name) ORDER BY name ASC",
      sqlquery,
    )
    await dbc.close()
    return res
  }
}
