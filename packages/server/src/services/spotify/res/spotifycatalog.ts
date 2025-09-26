import { HttpAuth } from "@/core/http/"
import { SpotifyAuth } from "./spotifyauth"
import { extractId } from "./utils"

export class SpotifyCatalog {
  async describe(uri: string) {
    const url = `${process.env.SPOTIFY_API}/descriptions/${encodeURIComponent(uri)}`
    return await HttpAuth.get(url, await this.getAuthHeaders(), true)
  }

  async getTrack(id: string) {
    const url = `${process.env.SPOTIFY_API}/tracks/${extractId(id)}`
    return await HttpAuth.get(url, await this.getAuthHeaders(), true)
  }

  async getAlbum(uri: string) {
    const url = `${process.env.SPOTIFY_API}/albums/${extractId(uri)}`
    return await HttpAuth.get(url, await this.getAuthHeaders(), true)
  }

  async getArtist(id: string) {
    const url = `${process.env.SPOTIFY_API}/artists/${extractId(id)}`
    return await HttpAuth.get(url, await this.getAuthHeaders(), true)
  }

  async getShow(id: string, offset: number, limit: number) {
    const url = `${process.env.SPOTIFY_API}/shows/${extractId(id)}?offset=${offset}&limit=${limit}`
    return await HttpAuth.get(url, await this.getAuthHeaders(), true)
  }

  async getEpisode(id: string) {
    const url = `${process.env.SPOTIFY_API}/episodes/${extractId(id)}`
    return await HttpAuth.get(url, await this.getAuthHeaders(), true)
  }

  private async getAuthHeaders() {
    return await SpotifyAuth.getAuthorization()
  }
}
