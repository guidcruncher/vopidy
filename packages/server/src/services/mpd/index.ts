import { logger } from "@/core/logger"
const mpdapi = require("mpd-api")
import { Mixer } from "@/services/mixer"
import { TuneIn } from "@/services/tunein"
import { db } from "@/services/db"
import { WsClientStore } from "@/core/wsclientstore"
import { RadioBrowser } from "@/services/radiobrowser"
import { LocalMusic } from "@/services/localmusic"
import * as fs from "fs"
import { Config } from "@/core/config"

export class Mpd {
  private async getMpdClient() {
    const config = {
      path: process.env.VOPIDY_SOCKETS.toString() + "/mpd",
      //      host: "localhost",
      //      port: 6600,
    }
    return await mpdapi.connect(config)
  }

  public async playTrackFile(filename: string) {
    try {
      if (fs.existsSync(filename)) {
        await this.setMpdOutput()
        logger.trace(`Playing ${filename}`)
        const client = await this.getMpdClient()
        await client.api.queue.clear()
        await client.api.queue.add(`${filename}`)
        let state = await client.api.playback.play(0)
        if (state == "OK") {
          WsClientStore.broadcast({ type: "playing", data: { source: "mpd" } })
        } else {
          logger.error(`Error starting playback ${state}`)
        }
      } else {
        logger.error(`Playback error, file not found or unavailable ${filename}`)
      }
    } catch (err) {
      logger.error("Error in playTrackFile", err)
    }
    return await this.getStatus()
  }

  public async setMpdOutput() {
    const config = Config.load()
    const client = await this.getMpdClient()
    const outputs = await client.api.outputs.list()
    let selected: any = {}

    if (config.enableBitPerfectPlayback) {
      selected = outputs.find((t) => t.outputname == "bitperfect")
    } else {
      selected = outputs.find((t) => t.outputname == "normal")
    }

    if (selected.outputenabled) {
      return true
    }

    for (let i = 0; i < outputs.length; i++) {
      const output = outputs[i]
      if (output.outputenabled) {
        await client.api.outputs.toggle(output.outputid)
      }
    }

    if (config.enableBitPerfectPlayback) {
      selected = outputs.find((t) => t.outputname == "bitperfect")
    } else {
      selected = outputs.find((t) => t.outputname == "normal")
    }
    await client.api.outputs.toggle(selected.outputid)

    return true
  }

  public async playTrackUrl(url: string) {
    try {
      logger.trace(`Playing ${url}`)
      await this.setMpdOutput()
      const client = await this.getMpdClient()
      await client.api.queue.clear()
      await client.api.queue.add(url)
      let state = await client.api.playback.play(0)
      if (state != "OK") {
        logger.error(`Error starting playback ${state}`)
      } else {
        WsClientStore.broadcast({ type: "playing", data: { source: "mpd" } })
      }
    } catch (err) {
      logger.error("Error in playTrackUrl", err)
    }
    return await this.getStatus()
  }

  public async previous() {
    const client = await this.getMpdClient()
    await client.api.playback.prev()
    return await this.getStatus()
  }

  public async next() {
    const client = await this.getMpdClient()
    await client.api.playback.next()
    return await this.getStatus()
  }

  public async stop() {
    const client = await this.getMpdClient()
    await client.api.playback.stop()
    Mixer.removePlaybackState()
    await client.api.queue.clear()
    WsClientStore.broadcast({ type: "stopped", data: { source: "mpd" } })
    return await this.getStatus()
  }

  public async pause() {
    const client = await this.getMpdClient()
    await client.api.playback.pause()
    WsClientStore.broadcast({ type: "paused", data: { source: "mpd" } })
    return await this.getStatus()
  }

  public async resume() {
    const client = await this.getMpdClient()
    await client.api.playback.play()
    WsClientStore.broadcast({ type: "playing", data: { source: "mpd" } })
    return await this.getStatus()
  }

  public async mute() {
    await this.setVolume(0)
    WsClientStore.broadcast({ type: "volume", data: { source: "mpd", value: 0 } })
    return await this.getStatus()
  }

  public async setVolume(volume: number) {
    const client = await this.getMpdClient()
    await client.api.playback.setvol(volume)
    WsClientStore.broadcast({ type: "volume", data: { source: "mpd", value: volume } })
    return await this.getStatus()
  }

  public async getVolume() {
    const client = await this.getMpdClient()
    await client.api.playback.getvol()
  }

  public async getStatus() {
    const client = await this.getMpdClient()
    const state = await client.api.status.get()
    const song = await client.api.status.currentsong()
    let view = undefined
    const playback = Mixer.getPlaybackState()
    const tuneinClient = new TuneIn()
    const radioBrowserClient = new RadioBrowser()
    const localClient = new LocalMusic()

    state.source = "mpd"

    switch (playback.source) {
      case "tunein":
        state.track = await tuneinClient.describe(playback.uri)
        state.source = "tunein"
        break
      case "stream":
        state.track = await db.getPlaylistItem(playback.uri)
        state.source = "stream"
        break
      case "radiobrowser":
        state.track = await radioBrowserClient.describe(playback.uri)
        state.source = "radiobrowser"
        break
      case "library":
        state.track = await localClient.describe(playback.uri)
        state.source = "library"
        break
    }

    if (!state.track) {
      state.track = {}
    }
    if (song) {
      state.track.nowplaying = song.title ?? ""
    }

    const vol = await this.getVolume()
    view = {
      source: state.source,
      track: state.track,
      playing: state.state == "play",
      paused: state.state == "pause",
      volume: vol,
    }

    return view
  }
}
