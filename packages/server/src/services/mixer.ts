import { logger } from "@/core/logger"
import { WsClientStore } from "@/core/wsclientstore"
import { Equaliser } from "@/services/equaliser"
import { FFplay } from "@/services/ffplay/"
import { IMediaPlayer } from "@/services/imediaplayer"
import { LocalMusic } from "@/services/localmusic"
import { Pulseaudio } from "@/services/pulseaudio"
import { RadioBrowser } from "@/services/radiobrowser"
import { Spotify } from "@/services/spotify"
import { Streamer } from "@/services/streamer"
import { TuneIn } from "@/services/tunein"
import * as fs from "node:fs"

export class PlaybackState {
  uri: string = ""
  source: string = ""
  volume: number = 100
  lastvolume: number = 100
  muted: boolean = false
  mixer: any = undefined
  librespot: string = ""
}

const devicemap = {
  spotify: "spotify",
  tunein: "mpd",
  radiobrowser: "mpd",
  stream: "mpd",
  library: "mpd",
}

export class Mixer {
  public static async ensureSource(source: string) {
    const state = Mixer.getPlaybackState()
    if (state.source == source) {
      return false
    }

    if (state.source != "") {
      if (devicemap[state.source] != devicemap[source]) {
        Mixer.stopdevice(devicemap[state.source])
      }
    }

    WsClientStore.broadcast({
      type: "source-changed",
      data: { current: state.source, new: source },
    })
  }

  public static getMediaPlayer(): IMediaPlayer {
    return FFplay.Instance
  }

  public static async pause() {
    const mpdClient = Mixer.getMediaPlayer()
    const spotifyClient = new Spotify()
    switch (await Mixer.activeOutputDevice()) {
      case "tunein":
      case "stream":
      case "radiobrowser":
      case "library":
      case "mpd":
        return await mpdClient.pause()
      case "spotify":
        return await spotifyClient.pause()
    }

    return ""
  }

  public static async seek(position: number) {
    const spotifyClient = new Spotify()
    return await spotifyClient.seek(position)
  }

  public static async previous() {
    const mpdClient = Mixer.getMediaPlayer()
    const spotifyClient = new Spotify()

    switch (await Mixer.activeOutputDevice()) {
      case "tunein":
      case "stream":
      case "radiobrowser":
      case "library":
      case "mpd":
        return await mpdClient.previous()
      case "spotify":
        return await spotifyClient.previous()
    }

    return ""
  }

  public static async play(source: string, id: string) {
    const spotifyClient = new Spotify()
    const tuneInClient = new TuneIn()
    const radioBrowserClient = new RadioBrowser()
    const mpdClient = Mixer.getMediaPlayer()
    const localClient = new LocalMusic()
    const streamerClient = new Streamer()

    let res = {}

    Mixer.ensureSource(source)

    switch (source) {
      case "spotify":
        return await spotifyClient.play(`${id}`)
        break
      case "tunein":
        return await tuneInClient.play(`${id}`)
        break
      case "radiobrowser":
        return await radioBrowserClient.play(`${id}`)
        break
      case "stream":
        return await streamerClient.play(`${id}`)
        break
      case "library":
        return await localClient.play(`${id}`)
        break
    }
    return ""
  }

  public static async next() {
    const mpdClient = Mixer.getMediaPlayer()
    const spotifyClient = new Spotify()
    const ffplay = FFplay.Instance

    switch (await Mixer.activeOutputDevice()) {
      case "tunein":
      case "stream":
      case "radiobrowser":
      case "library":
      case "mpd":
        return await mpdClient.next()
      case "spotify":
        return await spotifyClient.next()
    }

    return ""
  }

  public static async resume() {
    const mpdClient = Mixer.getMediaPlayer()
    const spotifyClient = new Spotify()

    switch (await Mixer.activeOutputDevice()) {
      case "tunein":
      case "stream":
      case "radiobrowser":
      case "library":
      case "mpd":
        return await mpdClient.resume()
      case "spotify":
        return await spotifyClient.resume()
    }

    return ""
  }

  public static async stop() {
    const mpdClient = Mixer.getMediaPlayer()
    const spotifyClient = new Spotify()

    switch (await Mixer.activeOutputDevice()) {
      case "tunein":
      case "stream":
      case "radiobrowser":
      case "library":
      case "mpd":
        Mixer.removePlaybackState()
        return await mpdClient.stop()
      case "spotify":
        Mixer.removePlaybackState()
        return await spotifyClient.stop()
    }

    return ""
  }
  public static async getStatus() {
    const paClient = new Pulseaudio()
    const mpdClient = Mixer.getMediaPlayer()
    const spotifyClient = new Spotify()
    const source = Mixer.activeOutputDevice()
    let res: any = { playing: false, source: "" }
    let state = Mixer.getPlaybackState()
    let volume = await paClient.getVolume()
    let paState = await paClient.getSinkInfo()

    if (source != "") {
      switch (devicemap[source]) {
        case "mpd":
          res = await mpdClient.getStatus()
          break
        case "spotify":
          res = await spotifyClient.getStatus()
          break
      }
    }

    if (res) {
      res.volume = volume
      res.muted = paState.mute
    } else {
      res = { muted: paState.mute, volume: volume }
    }

    return res
  }

  public static async initialise() {
    const state = Mixer.getPlaybackState()
    await Mixer.setVolume(state.volume)
    if (state.muted) {
      await Mixer.mute()
    }
    if (state.mixer) {
      await Equaliser.initialise()
    }
  }

  public static savePlaybackTrack(source: string, uri: string) {
    let state = Mixer.getPlaybackState()
    state.uri = uri
    state.source = source

    Mixer.savePlaybackState(state)
  }

  public static setPlaybackState(obj: any) {
    let state = Mixer.getPlaybackState()

    if (obj.muted) {
      state.lastvolume = parseInt(state.volume.toString())
    }
    if (obj.volume) {
      if (state.lastvolume != obj.volume) {
        state.lastvolume = parseInt(state.volume.toString())
      }
    }

    Object.keys(obj).forEach((key) => {
      state[key] = obj[key]
    })

    Mixer.savePlaybackState(state)
  }

  public static savePlaybackState(state: PlaybackState) {
    const filename = process.env.VOPIDY_DB.toString() + "/playbackstate.json"
    if (fs.existsSync(filename)) {
      fs.unlinkSync(filename)
    }

    fs.writeFileSync(filename, JSON.stringify(state), "utf8")
  }

  public static removePlaybackState() {
    Mixer.setPlaybackState({ uri: "", source: "" })
  }

  public static getPlaybackState(): PlaybackState {
    const filename = process.env.VOPIDY_DB.toString() + "/playbackstate.json"

    if (fs.existsSync(filename)) {
      const raw = fs.readFileSync(filename, "utf8")
      return JSON.parse(raw) as PlaybackState
    }

    return new PlaybackState()
  }

  public static async mute() {
    const paClient = new Pulseaudio()
    return await paClient.mute()
  }

  public static async unmute() {
    const paClient = new Pulseaudio()
    return await paClient.unmute()
  }

  public static activeOutputDevice() {
    const playbackState = Mixer.getPlaybackState()
    if (playbackState && playbackState.source) {
      return playbackState.source
    }

    return ""
  }

  public static async stopdevice(output: string = "") {
    const mpdClient = Mixer.getMediaPlayer()
    const spotifyClient = new Spotify()

    const promises = []

    if (output == "mpd" || output == "") {
      logger.trace("Stopping " + output)
      await mpdClient.stop()
    }

    if (output == "spotify" || output == "") {
      logger.trace("Stopping " + output)
      await spotifyClient.stop()
    }

    return true
  }

  public static async setVolume(volume: number) {
    const paClient = new Pulseaudio()
    Mixer.setPlaybackState({ volume: volume, muted: false })
    return await paClient.setVolume(volume)
  }
}
