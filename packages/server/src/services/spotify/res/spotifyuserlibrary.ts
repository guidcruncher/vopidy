import { Body, HttpAuth } from "@/core/http/"
import { SpotifyAuth } from "./spotifyauth"
import { extractId } from "./utils"

export class SpotifyUserLibrary {
  async saveToLibrary(id: string) {
    const url = `${process.env.SPOTIFY_API}/me/tracks`
    return await HttpAuth.put(url, Body.json({ ids: [extractId(id)] }), await this.getAuthHeaders())
  }

  async removeFromLibrary(id: string) {
    const url = `${process.env.SPOTIFY_API}/me/tracks?ids=${id}`
    return await HttpAuth.delete(url, await this.getAuthHeaders())
  }

  async inLibrary(id: string) {
    const url = `${process.env.SPOTIFY_API}/me/tracks/contains?ids=${extractId(id)}`
    return await HttpAuth.get(url, await this.getAuthHeaders(), false)
  }

  async follow(type: string, id: string) {
    const url = `${process.env.SPOTIFY_API}/me/following?type=${type}&ids=${extractId(id)}`
    return await HttpAuth.put(url, null, await this.getAuthHeaders())
  }

  async unfollow(type: string, id: string) {
    const url = `${process.env.SPOTIFY_API}/me/following?type=${type}&ids=${extractId(id)}`
    return await HttpAuth.delete(url, await this.getAuthHeaders())
  }

  async doesFollow(type: string, id: string) {
    const url = `${process.env.SPOTIFY_API}/me/following/contains?type=${type}&ids=${extractId(id)}`
    return await HttpAuth.get(url, await this.getAuthHeaders(), false)
  }

  private async getAuthHeaders() {
    return await SpotifyAuth.getAuthorization()
  }
}
