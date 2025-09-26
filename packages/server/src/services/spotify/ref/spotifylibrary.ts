import { http } from "@/core/http"

export class SpotifyLibrary {
  async getPlaylists(offset = 0, limit = 20) {
    const url = `${process.env.SPOTIFY_API}/me/playlists?offset=${offset}&limit=${limit}`
    return await http.get(url, await this.getAuthHeaders())
  }

  async getPlaylist(uri: string, offset: number, limit: number) {
    const id = uri.split(":").pop()
    const url = `${process.env.SPOTIFY_API}/playlists/${id}?offset=${offset}&limit=${limit}`
    return await http.get(url, await this.getAuthHeaders())
  }

  async getAlbums(offset = 0, limit = 20) {
    const url = `${process.env.SPOTIFY_API}/me/albums?offset=${offset}&limit=${limit}`
    return await http.get(url, await this.getAuthHeaders())
  }

  async getTracks(offset = 0, limit = 20) {
    const url = `${process.env.SPOTIFY_API}/me/tracks?offset=${offset}&limit=${limit}`
    return await http.get(url, await this.getAuthHeaders())
  }

  async getShows(offset = 0, limit = 20) {
    const url = `${process.env.SPOTIFY_API}/me/shows?offset=${offset}&limit=${limit}`
    return await http.get(url, await this.getAuthHeaders())
  }

  async getArtists() {
    const url = `${process.env.SPOTIFY_API}/me/following?type=artist`
    return await http.get(url, await this.getAuthHeaders())
  }

  private async getAuthHeaders() {
    const token = process.env.SPOTIFY_ACCESS_TOKEN
    return { Authorization: `Bearer ${token}` }
  }
}
