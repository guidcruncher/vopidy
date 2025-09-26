import { HttpAuth } from "@/core/http/"

export class SpotifyLibrary {
  async getPlaylists(offset = 0, limit = 20) {
    const url = `${process.env.SPOTIFY_API}/me/playlists?offset=${offset}&limit=${limit}`
    return await HttpAuth.get(url, await this.getAuthHeaders(), true)
  }

  async getPlaylist(uri: string, offset: number, limit: number) {
    const id = uri.split(":").pop()
    const url = `${process.env.SPOTIFY_API}/playlists/${id}?offset=${offset}&limit=${limit}`
    return await HttpAuth.get(url, await this.getAuthHeaders(), true)
  }

  async getAlbums(offset = 0, limit = 20) {
    const url = `${process.env.SPOTIFY_API}/me/albums?offset=${offset}&limit=${limit}`
    return await HttpAuth.get(url, await this.getAuthHeaders(), true)
  }

  async getTracks(offset = 0, limit = 20) {
    const url = `${process.env.SPOTIFY_API}/me/tracks?offset=${offset}&limit=${limit}`
    return await HttpAuth.get(url, await this.getAuthHeaders(), true)
  }

  async getShows(offset = 0, limit = 20) {
    const url = `${process.env.SPOTIFY_API}/me/shows?offset=${offset}&limit=${limit}`
    return await HttpAuth.get(url, await this.getAuthHeaders(), true)
  }

  async getArtists() {
    const url = `${process.env.SPOTIFY_API}/me/following?type=artist`
    return await HttpAuth.get(url, await this.getAuthHeaders(), true)
  }

  private async getAuthHeaders() {
    return await SpotifyAuth.getAuthorization()
  }
}
