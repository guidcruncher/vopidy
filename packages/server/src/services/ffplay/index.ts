import { logger } from "@/core/logger"
import { WsClientStore } from "@/core/wsclientstore"
import { db } from "@/services/db"
import { IMediaPlayer } from "@/services/imediaplayer"
import { LocalMusic } from "@/services/localmusic"
import { Mixer } from "@/services/mixer"
import { Pulseaudio } from "@/services/pulseaudio"
import { RadioBrowser } from "@/services/radiobrowser"
import { TuneIn } from "@/services/tunein"
import { spawn, spawnSync } from "child_process"
import * as fs from "fs"

export class FFplay implements IMediaPlayer {
  private static paused: boolean = false
  private static active: boolean = false
  private static proc: any = undefined
  private static stopped: boolean = false
  private static url: string = ""
  private static nowplaying: string = ""
  private static _instance: FFplay

  private constructor() {}

  public static get Instance() {
    return this._instance || (this._instance = new this())
  }

  private tryGetProcess() {
    const pidFile = "/local/state/ffplay.pid"

    if (!fs.existsSync(pidFile)) {
      return
    }

    const pid = fs.readFileSync(pidFile)
  }

  private onshutdown() {
    if (FFplay.proc) {
      FFplay.proc.kill("SIGKILL")
    }
    const pidFile = "/local/state/ffplay.pid"
    if (fs.existsSync(pidFile)) {
      fs.unlinkSync(pidFile)
    }
    Mixer.removePlaybackState()
  }

  public async playTrackUrl(url: string) {
    return await this.playTrackFile(`${url}`)
  }

  public async playTrackFile(filename: string) {
    const pidFile = "/local/state/ffplay.pid"
    let opts = ["-nodisp", "-autoexit"]
    opts.unshift(filename)

    try {
      if (FFplay.active) {
        await this.stop()
      }

      logger.debug("/usr/bin/ffplay " + opts.join(" "))
      FFplay.proc = spawn("/usr/bin/ffplay", opts, { stdio: "ignore" })
      fs.writeFileSync(pidFile, FFplay.proc.pid.toString())

      process.on("exit", this.onshutdown)

      FFplay.proc.on("exit", () => {
        if (FFplay.active) {
          FFplay.active = false
          process.removeListener("exit", this.onshutdown)
        }
      })

      FFplay.url = filename
      FFplay.active = true
      WsClientStore.broadcast({ type: "playing", data: { source: "mpd" } })
    } catch (err) {
      logger.error("Error in playTrackFile", err)
    }

    return await this.getStatus()
  }

  public async pause() {
    if (!FFplay.active) {
      return
    }
    if (!FFplay.paused) {
      FFplay.proc.kill("SIGSTOP")
      FFplay.paused = true
      WsClientStore.broadcast({ type: "paused", data: { source: "mpd" } })
    }
    return await this.getStatus()
  }

  public async resume() {
    if (!FFplay.active) {
      return
    }
    if (FFplay.paused) {
      FFplay.proc.kill("SIGCONT")
      FFplay.paused = false
      WsClientStore.broadcast({ type: "playing", data: { source: "mpd" } })
    }
    return await this.getStatus()
  }

  public async stop() {
    if (!FFplay.active) {
      return
    }
    FFplay.url = ""
    FFplay.stopped = true
    FFplay.proc.kill("SIGKILL")
    FFplay.active = false
    FFplay.proc = undefined
    WsClientStore.broadcast({ type: "stopped", data: { source: "mpd" } })

    const pidFile = "/local/state/ffplay.pid"
    if (fs.existsSync(pidFile)) {
      fs.unlinkSync(pidFile)
    }

    return await this.getStatus()
  }

  public static shutdown() {
    if (!FFplay.active) {
      return
    }

    const pidFile = "/local/state/ffplay.pid"
    if (fs.existsSync(pidFile)) {
      fs.unlinkSync(pidFile)
    }

    FFplay.stopped = true
    FFplay.url = ""
    FFplay.proc.kill("SIGKILL")
    FFplay.active = false
    FFplay.proc = undefined
  }

  public async getNowPlaying() {
    const info = { artist: "", title: "", streamTitle: "" }

    if (!FFplay.active || FFplay.url == "") {
      return ""
    }

    try {
      const opts = [`${FFplay.url}`, `-show_entries`, `format_tags`]
      const stateProc = spawnSync("/usr/bin/ffprobe", opts, { encoding: "utf-8" })
      const res = (stateProc.stdout ?? "").toString().split("\n")
      let title = ""
      for (const line of res) {
        if (line.trim().startsWith("TAG:artist=")) {
          info.artist = line.trim().replaceAll("TAG:artist=", "")
        }

        if (line.trim().startsWith("TAG:title=")) {
          info.title = line.trim().replaceAll("TAG:title=", "")
        }

        if (line.trim().startsWith("TAG:StreamTitle=")) {
          info.streamTitle = line.trim().replaceAll("TAG:StreamTitle=", "")
        }
      }

      if (FFplay.nowplaying != info.streamTitle) {
        FFplay.nowplaying = info.streamTitle
        WsClientStore.broadcast({
          type: "streamtitle-changed",
          data: { url: FFplay.url, tags: info },
        })
      }

      return info.streamTitle
    } catch (err) {
      logger.error("Error in getNowPlaying", err)
      if (FFplay.nowplaying != "") {
        FFplay.nowplaying = ""
        WsClientStore.broadcast({
          type: "streamtitle-changed",
          data: { url: FFplay.url, tags: info },
        })
      }
      return ""
    }
  }

  public async getStatus() {
    const paClient = new Pulseaudio()
    let view = undefined
    const playback = Mixer.getPlaybackState()
    const tuneinClient = new TuneIn()
    const radioBrowserClient = new RadioBrowser()
    const localClient = new LocalMusic()
    let state: any = {}
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

    state.track.nowplaying = await this.getNowPlaying()

    const vol = await paClient.getVolume()
    view = {
      source: state.source,
      track: state.track,
      playing: FFplay.active,
      paused: FFplay.paused,
      volume: vol,
    }

    return view
  }

  public async next() {
    return this.getStatus()
  }

  public async previous() {
    return this.getStatus()
  }

  public async seek(position: number) {
    return {}
  }
}
