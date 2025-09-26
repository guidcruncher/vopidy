import { http } from "@/core/http"
import { extractId } from "./utils"

export class SpotifyUserLibrary {
  async saveToLibrary(id: string) {
    const url = `${process.env.SPOTIFY_API}/me/tracks`
    return await http.put(url, http.JsonBody({ ids: [extractId(id)] }), await this.getAuthHeaders())
  }

  async removeFromLibrary(id: string) {
    const url = `${process.env.SPOTIFY_API}/me/tracks`
    return await http.delete(
      url,
      http.JsonBody({ ids: [extractId(id)] }),
      await this.getAuthHeaders(),
    )
  }

  async inLibrary(id: string) {
    const url = `${process.env.SPOTIFY_API}/me/tracks/contains?ids=${extractId(id)}`
    return await http.get(url, await this.getAuthHeaders())
  }

  async follow(type: string, id: string) {
    const url = `${process.env.SPOTIFY_API}/me/following?type=${type}&ids=${extractId(id)}`
    return await http.put(url, null, await this.getAuthHeaders())
  }

  async unfollow(type: string, id: string) {
    const url = `${process.env.SPOTIFY_API}/me/following?type=${type}&ids=${extractId(id)}`
    return await http.delete(url, null, await this.getAuthHeaders())
  }

  async doesFollow(type: string, id: string) {
    const url = `${process.env.SPOTIFY_API}/me/following/contains?type=${type}&ids=${extractId(id)}`
    return await http.get(url, await this.getAuthHeaders())
  }

  private async getAuthHeaders() {
    const token = process.env.SPOTIFY_ACCESS_TOKEN
    return { Authorization: `Bearer ${token}` }
  }
}
