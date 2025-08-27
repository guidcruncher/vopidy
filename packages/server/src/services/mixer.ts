import { Mpd } from "@/services/mpd"
import { Spotify } from "@/services/spotify"
import * as fs from "node:fs"
import { logger } from "@/core/logger"
import { Equaliser } from "@/services/equaliser"
import { WsClientStore } from "@/core/wsclientstore"

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
        Mixer.stop(devicemap[state.source])
      }
    }

    WsClientStore.broadcast({
      type: "source-changed",
      data: { current: state.source, new: source },
    })
  }

  public static async getStatus() {
    const mpdClient = new Mpd()
    const spotifyClient = new Spotify()
    const source = Mixer.activeOutputDevice()
    let res: any = { playing: false, source: "" }
    let state = Mixer.getPlaybackState()

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
      res.volume = state.volume
      res.muted = state.muted
    } else {
      res = { muted: state.muted, volume: state.volume }
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
    const mpdClient = new Mpd()
    const spotifyClient = new Spotify()
    const source = Mixer.activeOutputDevice()
    let state: any = {}
    switch (source) {
      case "stream":
      case "tunein":
      case "radiobrowser":
      case "mpd":
        state = await mpdClient.getStatus()
        break
      case "spotify":
        state = await spotifyClient.getStatus()
        break
    }

    if (state && state.volume) {
      await mpdClient.mute()
      await spotifyClient.mute()
    }

    Mixer.setPlaybackState({ muted: true })

    switch (source) {
      case "stream":
      case "tunein":
      case "radiobrowser":
      case "mpd":
        state = await mpdClient.getStatus()
        break
      case "spotify":
        state = await spotifyClient.getStatus()
        break
    }

    state.muted = true
    return state
  }

  public static async unmute() {
    Mixer.setPlaybackState({ muted: false })
    let state = Mixer.getPlaybackState()
    return await Mixer.setVolume(state.lastvolume)
  }

  public static activeOutputDevice() {
    const playbackState = Mixer.getPlaybackState()
    if (playbackState && playbackState.source) {
      return playbackState.source
    }

    return ""
  }

  public static async stop(output: string = "") {
    const mpdClient = new Mpd()
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

    let stateMpd: any = await mpdClient.getStatus()
    let stateLibrespot: any = await spotifyClient.getStatus()
    if (!stateMpd) {
      stateMpd = { playing: false }
    }
    if (!stateLibrespot) {
      stateLibrespot = { playing: false }
    }

    if (output == "mpd" && stateLibrespot.playing) {
      await spotifyClient.stop()
    }

    if (output == "spotify" && stateMpd.playing) {
      await mpdClient.stop()
    }

    if (output == "" && (stateMpd.playing || stateLibrespot.playing)) {
      await mpdClient.stop()
      await spotifyClient.stop()
      Mixer.setPlaybackState({ source: "", uri: "" })
    }
    return true
  }

  public static async setVolume(volume: number) {
    const isRejected = (input: PromiseSettledResult<unknown>): input is PromiseRejectedResult =>
      input.status === "rejected"

    const isFulfilled = <T>(input: PromiseSettledResult<T>): input is PromiseFulfilledResult<T> =>
      input.status === "fulfilled"

    const mpdClient = new Mpd()
    const spotifyClient = new Spotify()
    const promises = []
    promises.push(mpdClient.setVolume(volume))
    promises.push(spotifyClient.setVolume(volume))
    return Promise.allSettled(promises).then((res) => {
      const response = res.find(isFulfilled)?.value
      Mixer.setPlaybackState({ volume: volume, muted: false })
      return response
    })
  }
}
