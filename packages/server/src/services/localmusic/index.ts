import { logger } from "@/core/logger"
import { WsClientStore } from "@/core/wsclientstore"
import { db } from "@/services/db"
import { Mixer } from "@/services/mixer"
import * as fss from "fs" // for sync file check (play)
import * as fs from "fs/promises" // for async file operations (browse, describe)
import { parseFile } from "music-metadata"
import * as path from "path"
import * as zlib from "zlib"

// --- Models ---

// MusicFolder and MusicItem models remain as they are, but are separated here for clarity
export class MusicFolder {
  dir: string = ""
  items: MusicItem[] = []
}

export class MusicItem {
  id: string = ""
  filename: string = ""
  itemType: string = ""
  dir: string = ""
  image: string = ""
  name: string = ""
  album: string = ""
  artist: string = ""
  type: string = "library"
}

// --- Services ---

/**
 * Handles the encoding and decoding of file paths to/from compressed, Base64 IDs.
 */
export class MusicIDService {
  /**
   * Encodes a full file path into a compressed, Base64 ID.
   * @param fullPath The absolute path to the file or directory.
   * @returns The encoded ID string.
   */
  public computeId(fullPath: string): string {
    const compressedData = zlib.deflateSync(fullPath)
    return compressedData.toString("base64")
  }

  /**
   * Decodes a compressed, Base64 ID back into the original full file path.
   * @param id The encoded ID string.
   * @returns The full file path.
   */
  public decodeId(id: string): string {
    const compressedData = Buffer.from(id, "base64")
    const decompressedData = zlib.inflateSync(compressedData)
    return decompressedData.toString()
  }
}

// Define the root path once
const rootPath = "/srv/files/music"

/**
 * Handles file system operations and extracting metadata for a single music item.
 */
export class MusicMetadataService {
  private idService: MusicIDService

  constructor(idService: MusicIDService) {
    this.idService = idService
  }

  /**
   * Generates a MusicItem object from a full file path (used for browse/listing).
   * It populates basic file info and optionally metadata.
   * @param fullPath The absolute path to the file or directory.
   * @param dirent The fs.Dirent object if available (e.g., from fs.opendir).
   * @returns A promise that resolves to a populated MusicItem.
   */
  public async createItemFromPath(
    fullPath: string,
    dir: string,
    dirent?: fss.Dirent,
  ): Promise<MusicItem> {
    const pathInfo = path.parse(fullPath)
    const stats = dirent ? dirent : await fs.lstat(fullPath)

    const item = new MusicItem()
    item.filename = pathInfo.base
    item.dir = dir // The relative directory
    item.image = ""
    item.name = item.filename
    item.artist = ""
    item.itemType = stats.isFile() ? "file" : stats.isDirectory() ? "dir" : ""
    item.id = this.idService.computeId(fullPath)

    if (item.itemType === "file") {
      await this.fetchFileMetadata(fullPath, item)
    }

    if (item.name === "") {
      item.name = item.filename
    }

    return item
  }

  /**
   * Fetches rich metadata (title, artist, album) for a music file and updates the MusicItem.
   * @param fullPath The absolute path to the file.
   * @param item The MusicItem object to update.
   */
  private async fetchFileMetadata(fullPath: string, item: MusicItem): Promise<void> {
    try {
      const metadata = await parseFile(fullPath, {
        skipCovers: true,
        duration: false,
      })
      if (metadata) {
        item.album = metadata.common.album ?? ""
        item.name = metadata.common.title ?? item.filename
        item.artist = metadata.common.artist ?? ""
      }
    } catch (err) {
      logger.error(`Error in metadata fetch for ${fullPath}`, err)
      // Item name and artist remain as their defaults or are set to empty string above
    }
  }
}

/**
 * Provides the main business logic for the local music library, coordinating ID and Metadata services.
 */
export class LocalMusic {
  private idService: MusicIDService
  private metadataService: MusicMetadataService

  constructor() {
    this.idService = new MusicIDService()
    this.metadataService = new MusicMetadataService(this.idService)
  }

  /**
   * Retrieves detailed information about a music item by its ID.
   * @param id The compressed, Base64 ID of the music item.
   * @returns A promise resolving to the MusicItem or undefined if not found/error.
   */
  public async describe(id: string): Promise<MusicItem | undefined> {
    try {
      const fullPath = this.idService.decodeId(id)
      const dir = path.parse(fullPath).dir.replace(rootPath, "") // Determine relative directory

      // Use the metadata service to create and populate the item
      const item = await this.metadataService.createItemFromPath(fullPath, dir)
      item.id = id // Ensure the ID is the passed-in ID

      // Only return if it's a valid type (file or dir)
      return item.itemType ? item : undefined
    } catch (err) {
      logger.error("Error in describe", err)
      return undefined
    }
  }

  /**
   * Initiates playback for a music file identified by its ID.
   * @param id The compressed, Base64 ID of the music file.
   * @returns A promise resolving to the played MusicItem or undefined if playback failed.
   */
  public async play(id: string): Promise<MusicItem | undefined> {
    const item = await this.describe(id)
    if (!item || item.itemType !== "file") {
      logger.warn(`Cannot play item ID ${id}: Item not found or is not a file.`)
      return undefined
    }

    const filename = this.idService.decodeId(id)
    logger.trace(`Attempting to play: ${filename}`)

    if (fss.existsSync(filename)) {
      try {
        const mpdClient = Mixer.getMediaPlayer()
        Mixer.savePlaybackTrack("library", id)
        await mpdClient.play(filename)
        db.addToPlaybackHistory("library", item)
        WsClientStore.broadcast({ type: "track-changed", data: item })
        return item
      } catch (e) {
        logger.error(`Error playing track ${filename}`, e)
        return undefined
      }
    } else {
      logger.error(`File not found or unreachable: ${filename}`)
      return undefined
    }
  }

  /**
   * Browses the contents of a given directory within the root music path.
   * @param dir The relative path of the directory to browse (e.g., "/Artist/Album").
   * @returns A promise resolving to a MusicFolder containing the items.
   */
  public async browse(dir: string): Promise<MusicFolder> {
    const fullPath = path.join(rootPath, dir)
    const musicFolder = new MusicFolder()
    let items: MusicItem[] = []
    musicFolder.dir = dir

    try {
      const dirHandle = await fs.opendir(fullPath)
      for await (const dirent of dirHandle) {
        const itemFullPath = path.join(fullPath, dirent.name)

        // Skip hidden files/directories
        if (dirent.name.startsWith(".")) continue

        try {
          // Use the metadata service to create and populate the item efficiently
          const item = await this.metadataService.createItemFromPath(itemFullPath, dir, dirent)

          if (item.itemType !== "") {
            items.push(item)
          }
        } catch (err) {
          logger.error(`Failed to process directory entry ${dirent.name}`, err)
        }
      }
    } catch (err) {
      logger.error(`Error browsing directory ${fullPath}`, err)
    }

    // Sort: directories first, then files, both alphabetically by name
    items.sort((a, b) => {
      const aSort = `${a.itemType} ${a.name}`
      const bSort = `${b.itemType} ${b.name}`
      return aSort.localeCompare(bSort)
    })

    musicFolder.items = items
    return musicFolder
  }
}
