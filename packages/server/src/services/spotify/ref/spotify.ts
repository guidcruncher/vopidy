import { IMediaPlayer } from "@/services/imediaplayer"
import { LibrespotManager } from "./librespotmanager"
import { SpotifyAuth } from "./spotifyauth"
import { SpotifyCatalog } from "./spotifycatalog"
import { SpotifyLibrary } from "./spotifylibrary"
import { SpotifyPlayer } from "./spotifyplayer"
import { SpotifyUserLibrary } from "./spotifyuserlibrary"
import { getCodeImageUrl } from "./utils"

export class Spotify implements IMediaPlayer {
  auth: SpotifyAuth
  librespot: LibrespotManager
  player: SpotifyPlayer
  catalog: SpotifyCatalog
  library: SpotifyLibrary
  userLibrary: SpotifyUserLibrary

  constructor() {
    this.auth = new SpotifyAuth()
    this.librespot = new LibrespotManager()
    this.player = new SpotifyPlayer()
    this.catalog = new SpotifyCatalog()
    this.library = new SpotifyLibrary()
    this.userLibrary = new SpotifyUserLibrary()
  }

  // Convenience wrapper — can be used by UI
  getCodeImageUrl(uri: string, color = "533191", whiteBar = true) {
    return getCodeImageUrl(uri, color, whiteBar)
  }

  // --- IMediaPlayer interface methods ---
  async play(uri: string) {
    return await this.player.playTrack(uri)
  }

  async pause() {
    return await this.player.pause()
  }

  async resume() {
    return await this.player.resume()
  }

  async stop() {
    return await this.player.stop()
  }

  async next() {
    return await this.player.next()
  }

  async previous() {
    return await this.player.previous()
  }

  async seek(position: number) {
    return await this.player.seek(position)
  }

  async setVolume(volume: number) {
    return await this.player.setVolume(volume)
  }

  async getVolume() {
    return await this.player.getVolume()
  }

  async mute() {
    return await this.player.mute()
  }

  async getStatus() {
    return await this.player.getStatus()
  }
}
