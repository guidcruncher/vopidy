import { http } from "@/core/http"
import { extractId } from "./utils"

export class SpotifyCatalog {
  async describe(uri: string) {
    const url = `${process.env.SPOTIFY_API}/descriptions/${encodeURIComponent(uri)}`
    return await http.get(url, await this.getAuthHeaders())
  }

  async getTrack(id: string) {
    const url = `${process.env.SPOTIFY_API}/tracks/${extractId(id)}`
    return await http.get(url, await this.getAuthHeaders())
  }

  async getAlbum(uri: string) {
    const url = `${process.env.SPOTIFY_API}/albums/${extractId(uri)}`
    return await http.get(url, await this.getAuthHeaders())
  }

  async getArtist(id: string) {
    const url = `${process.env.SPOTIFY_API}/artists/${extractId(id)}`
    return await http.get(url, await this.getAuthHeaders())
  }

  async getShow(id: string, offset: number, limit: number) {
    const url = `${process.env.SPOTIFY_API}/shows/${extractId(id)}?offset=${offset}&limit=${limit}`
    return await http.get(url, await this.getAuthHeaders())
  }

  async getEpisode(id: string) {
    const url = `${process.env.SPOTIFY_API}/episodes/${extractId(id)}`
    return await http.get(url, await this.getAuthHeaders())
  }

  private async getAuthHeaders() {
    const token = process.env.SPOTIFY_ACCESS_TOKEN
    return { Authorization: `Bearer ${token}` }
  }
}
