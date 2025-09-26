import { http } from "@/core/http"
import { logger } from "@/core/logger"
import { WsClientStore } from "@/core/wsclientstore"
import { Mixer } from "@/services/mixer"

export class SpotifyPlayer {
  async playTrack(uri: string) {
    const url = `${process.env.GOLIBRESPOT_API}/player/play`
    const body = { uri, skip_to_uri: "", paused: false }
    const res = await http.post(url, http.JsonBody(body))

    // Track info → database
    try {
      const track = await this.getTrackFromUri(uri)
      if (track) {
        await db.songs.insert(track)
        await Mixer.setPlayerState("spotify", track.id, false)
        WsClientStore.notify("play", { service: "spotify", uri, track })
      }
    } catch (err) {
      logger.error("Error saving track metadata:", err)
    }

    return res
  }

  async pause() {
    const url = `${process.env.GOLIBRESPOT_API}/player/pause`
    const res = await http.put(url)
    await Mixer.setPaused(true)
    WsClientStore.notify("pause", { service: "spotify" })
    return res
  }

  async resume() {
    const url = `${process.env.GOLIBRESPOT_API}/player/resume`
    const res = await http.put(url)
    await Mixer.setPaused(false)
    WsClientStore.notify("resume", { service: "spotify" })
    return res
  }

  async stop() {
    const url = `${process.env.GOLIBRESPOT_API}/player/pause`
    const res = await http.put(url)
    await Mixer.setStopped()
    WsClientStore.notify("stop", { service: "spotify" })
    return res
  }

  async next() {
    const url = `${process.env.GOLIBRESPOT_API}/player/next`
    return await http.post(url)
  }

  async previous() {
    const url = `${process.env.GOLIBRESPOT_API}/player/previous`
    return await http.post(url)
  }

  async seek(position: number) {
    const url = `${process.env.GOLIBRESPOT_API}/player/seek`
    return await http.post(url, http.JsonBody({ position_ms: position }))
  }

  async setVolume(volume: number) {
    const url = `${process.env.GOLIBRESPOT_API}/player/volume`
    return await http.put(url, http.JsonBody({ volume_percent: volume }))
  }

  async getVolume() {
    const url = `${process.env.GOLIBRESPOT_API}/player/volume`
    const res = await http.get(url)
    return res.volume_percent
  }

  async mute() {
    return await this.setVolume(0)
  }

  async getStatus() {
    const url = `${process.env.GOLIBRESPOT_API}/player/status`
    return await http.get(url)
  }

  // helper for playTrack
  private async getTrackFromUri(uri: string) {
    if (!uri.startsWith("spotify:track:")) return null
    const id = uri.split(":")[2]
    const url = `${process.env.SPOTIFY_API}/tracks/${id}`
    return await http.get(url, await this.getAuthHeaders())
  }

  private async getAuthHeaders() {
    // avoid circular dep with SpotifyAuth — consider injecting instead
    const token = process.env.SPOTIFY_ACCESS_TOKEN
    return { Authorization: `Bearer ${token}` }
  }
}
