import { logger } from "@/core/logger"
import { WsClientStore } from "@/core/wsclientstore"
import { spawnSync } from "child_process"

export interface MediaTags {
  artist: string
  title: string
  streamTitle: string
}

export class FFplayMetadata {
  private nowplaying: string = ""

  public async getNowPlaying(url: string, isActive: boolean): Promise<MediaTags> {
    const info: MediaTags = { artist: "", title: "", streamTitle: "" }

    if (!isActive || url === "") {
      return info
    }

    try {
      // Use array notation for options to handle spaces in URLs/paths
      const opts = [url, `-show_entries`, `format_tags`]
      const stateProc = spawnSync("/usr/bin/ffprobe", opts, {
        encoding: "utf-8",
        maxBuffer: 1024 * 500,
      }) // Increase buffer for safety
      const res = (stateProc.stdout ?? "").toString().split("\n")

      for (const line of res) {
        const trimmedLine = line.trim()
        if (trimmedLine.startsWith("TAG:artist=")) {
          info.artist = trimmedLine.replace("TAG:artist=", "")
        } else if (trimmedLine.startsWith("TAG:title=")) {
          info.title = trimmedLine.replace("TAG:title=", "")
        } else if (trimmedLine.startsWith("TAG:StreamTitle=")) {
          info.streamTitle = trimmedLine.replace("TAG:StreamTitle=", "")
        }
      }

      if (this.nowplaying !== info.streamTitle) {
        this.nowplaying = info.streamTitle
        WsClientStore.broadcast({
          type: "streamtitle-changed",
          data: { url, tags: info },
        })
      }

      return info
    } catch (err) {
      logger.error("Error in FFplayMetadata.getNowPlaying", err)
      // Clean up nowplaying state on error
      if (this.nowplaying !== "") {
        this.nowplaying = ""
        WsClientStore.broadcast({
          type: "streamtitle-changed",
          data: { url, tags: info },
        })
      }
      return info
    }
  }
}
