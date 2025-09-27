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

  async setVolume(volume: number) {
    const url = `${process.env.GOLIBRESPOT_API}/player/volume`
    return await Http.put(url, Body.json({ volume_percent: volume }))
  }

  async getVolume() {
    const url = `${process.env.GOLIBRESPOT_API}/player/volume`
    const res = await Http.get(url)
    return res.response.volume_percent
  }

  async mute() {
    return await this.setVolume(0)
  }

  async getStatus() {
    const url = `${process.env.GOLIBRESPOT_API}/player/status`
    return await Http.get(url)
  }

  private async getAuthHeaders() {
    return await SpotifyAuth.getAuthorization()
  }
}
