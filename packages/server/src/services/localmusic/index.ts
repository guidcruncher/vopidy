import { logger } from "@/core/logger"
import { WsClientStore } from "@/core/wsclientstore"
import { db } from "@/services/db"
import { Mixer } from "@/services/mixer"
import * as fss from "fs"
import * as fs from "fs/promises"
import { parseFile } from "music-metadata"
import * as path from "path"
import * as zlib from "zlib"

const rootPath = "/srv/files/music"

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

export class LocalMusic {
  public async playTrack(id: string) {
    const item = await this.describe(id)
    const filename = await this.decodeId(id)
    logger.trace(`playTrack ${filename}`)

    if (item) {
      if (fss.existsSync(filename)) {
        const mpdClient = Mixer.getMediaPlayer()
        Mixer.savePlaybackTrack("library", id)
        await mpdClient.play(filename)
        db.addToPlaybackHistory("library", item)
        WsClientStore.broadcast({ type: "track-changed", data: item })
        return item
      } else {
        logger.error(`File not found or unreachable ${filename}`)
        return undefined
      }
    }

    return undefined
  }

  public async describe(id: string) {
    try {
      const filename = await this.decodeId(id)
      const pathInfo = path.parse(filename)
      const dirent = await fs.lstat(filename)
      const res = new MusicItem()
      res.filename = pathInfo.base
      res.dir = pathInfo.dir.replace(rootPath, "")
      res.image = ""
      res.name = res.filename
      res.artist = ""
      res.itemType = dirent.isFile() ? "file" : dirent.isDirectory() ? "dir" : ""
      res.id = id

      if (res.itemType != "") {
        if (res.itemType == "file") {
          try {
            const metadata = await parseFile(filename, {
              skipCovers: true,
              duration: false,
            })
            if (metadata) {
              res.album = metadata.common.album ?? ""
              res.name = metadata.common.title ?? res.filename
              res.artist = metadata.common.artist ?? ""
            }
          } catch (err) {
            logger.edrror("Error in metadata fetch", err)
            res.name = ""
            res.artist = ""
          }
          if (res.name == "") {
            res.name = res.filename
          }
        }
      }

      return res
    } catch (err) {
      logger.error("Error in describe", err)
      return undefined
    }
  }

  private async computeId(fullPath: string) {
    const compressedData = zlib.deflateSync(fullPath)
    return compressedData.toString("base64")
  }

  private async decodeId(id: string) {
    const compressedData = Buffer.from(id, "base64")
    const decompressedData = zlib.inflateSync(compressedData)
    return decompressedData.toString()
  }

  public async browse(dir: string) {
    const fullPath = path.join(rootPath, dir)
    let f = new MusicFolder()
    let items = []
    f.dir = dir

    const dirHandle = await fs.opendir(fullPath)
    for await (const dirent of dirHandle) {
      const res = new MusicItem()
      res.filename = dirent.name
      res.dir = dir
      res.image = ""
      res.name = res.filename
      res.artist = ""
      res.itemType = dirent.isFile() ? "file" : dirent.isDirectory() ? "dir" : ""
      res.id = await this.computeId(path.join(fullPath, dirent.name))

      if (res.itemType != "") {
        if (res.itemType == "file") {
          try {
            const metadata = await parseFile(path.join(fullPath, res.filename), {
              skipCovers: true,
              duration: false,
            })
            if (metadata) {
              res.album = metadata.common.album ?? ""
              res.name = metadata.common.title ?? res.filename
              res.artist = metadata.common.artist ?? ""
            }
          } catch (err) {
            logger.error("Error in metadata fetch", err)
            res.name = ""
            res.artist = ""
          }
        }
        if (res.name == "") {
          res.name = res.filename
        }
        items.push(res)
      }
    }

    items = items.sort((a, b) => `${a.itemType} ${a.name}`.localeCompare(`${b.itemType} ${b.name}`))
    f.items = f.items.concat(items)
    return f
  }
}
