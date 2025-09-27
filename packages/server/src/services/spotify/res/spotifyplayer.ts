import { Body, Http } from "@/core/http/"
import { logger } from "@/core/logger"
import { WsClientStore } from "@/core/wsclientstore"
import { db } from "@/services/db"
import { Mixer } from "@/services/mixer"
import { SpotifyAuth } from "./spotifyauth"

export class SpotifyPlayer {
  async playTrack(uri: string) {
    const url = `${process.env.GOLIBRESPOT_API}/player/play`
    const body = { uri, skip_to_uri: "", paused: false }
    const res = await Http.post(url, Body.json(body))

    // Track info → database
    try {
      const track = await this.getTrackFromUri(uri)
      if (track) {
        await db.songs.insert(track)
        await Mixer.savePlaybackTrack("spotify", uri)
        WsClientStore.notify("track-changed", { service: "spotify", uri, track })
      }
    } catch (err) {
      logger.error("Error saving track metadata:", err)
    }

    return res
  }

  async pause() {
    const url = `${process.env.GOLIBRESPOT_API}/player/pause`
    const res = await Http.put(url, Body.empty())
    WsClientStore.notify("pause", { service: "spotify" })
    return res
  }

  async resume() {
    const url = `${process.env.GOLIBRESPOT_API}/player/resume`
    const res = await Http.put(url, Body.empty())
    WsClientStore.notify("resume", { service: "spotify" })
    return res
  }

  async stop() {
    const url = `${process.env.GOLIBRESPOT_API}/player/pause`
    const res = await Http.put(url, Body.empty())
    WsClientStore.notify("stop", { service: "spotify" })
    return res
  }

  async next() {
    const url = `${process.env.GOLIBRESPOT_API}/player/next`
    return await Http.post(url, Body.empty())
  }

  async previous() {
    const url = `${process.env.GOLIBRESPOT_API}/player/previous`
    return await Http.post(url, Body.empty())
  }

  async seek(position: number) {
    const url = `${process.env.GOLIBRESPOT_API}/player/seek`
    return await Http.post(url, Body.json({ position_ms: position }))
  }

  public async getStatus() {
    const url = `${process.env.GOLIBRESPOT_API}/status`
    let res: any = await http.get(url)
    let track: any = {}

    if (res.status == 204) {
      res = await http.get(url)
    }

    if (!res.ok) {
      logger.error(res)
      return undefined
    }

    const json = res.response
    if (json.track) {
      track = await this.describe(json.track.uri)
      json.duration = json.track.duration
      json.position = { duration: json.duration, progress: json.progress_ms }
      json.track = track
      json.source = "spotify"
      const view = {
        output: "librespot",
        source: json.source,
        track: json.track,
        playing: !json.stopped,
        paused: json.paused,
        volume: json.volume,
        position: json.position,
      }
      return view
    }
  }

  private async getAuthHeaders() {
    return await SpotifyAuth.getAuthorization()
  }
}
