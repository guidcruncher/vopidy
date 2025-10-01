import { Authorization, Body, Http } from "@/core/http/"
import { logger } from "@/core/logger"
import { WsClientStore } from "@/core/wsclientstore"
import { db } from "@/services/db/"
import { Mixer } from "@/services/mixer/"
import { SpotifyAuth } from "./spotifyauth"
import { SpotifyCatalog } from "./spotifycatalog"

export class SpotifyPlayer {
  async playTrack(uri: string) {
    const url = `${process.env.GOLIBRESPOT_API}/player/play`
    const body = { uri, skip_to_uri: "", paused: false }
    const res = await Http.NoCache().post(url, Body.json(body))
    const catalog = new SpotifyCatalog()
    await SpotifyAuth.ensureConnection()
    // Track info → database
    try {
      const track = await catalog.describe(uri)
      if (track) {
        db.addToPlaybackHistory("spotify", track)
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
    const res = await Http.NoCache().post(url, Body.empty())
    WsClientStore.notify("pause", { service: "spotify" })
    return res
  }

  async resume() {
    const url = `${process.env.GOLIBRESPOT_API}/player/resume`
    const res = await Http.NoCache().post(url, Body.empty())
    WsClientStore.notify("resume", { service: "spotify" })
    return res
  }

  async stop() {
    const url = `${process.env.GOLIBRESPOT_API}/player/pause`
    const res = await Http.NoCache().post(url, Body.empty())
    WsClientStore.notify("stop", { service: "spotify" })
    return res
  }

  async next() {
    const url = `${process.env.GOLIBRESPOT_API}/player/next`
    return await Http.NoCache().post(url, Body.empty())
  }

  async previous() {
    const url = `${process.env.GOLIBRESPOT_API}/player/previous`
    return await Http.NoCache().post(url, Body.empty())
  }

  public async seek(position: number) {
    const url = `${process.env.GOLIBRESPOT_API}/player/seek`
    const body = { position: position * 1000, relative: false }
    const res = await Http.NoCache().post(url, Body.json(body))
    WsClientStore.broadcast({
      type: "track-seeked",
      data: { position: position, source: "spotify" },
    })
    let status: any = await this.getStatus()
    return status
  }

  public async getStatus() {
    const url = `${process.env.GOLIBRESPOT_API}/status`
    let res: any = await Http.NoCache().get(url)
    let track: any = {}
    await SpotifyAuth.ensureConnection()

    if (res.status == 204) {
      res = await Http.NoCache().get(url)
    }

    if (!res.ok) {
      logger.error(res)
      return undefined
    }

    const catalog = new SpotifyCatalog()
    const json = res.response
    if (json.track) {
      track = await catalog.describe(json.track.uri)
      json.duration = json.track.duration
      json.position = { duration: json.duration, progress: json.track.position }
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

  private async getAuthHeaders(): Promise<Authorization> {
    return await SpotifyAuth.getAuthorization()
  }
}
