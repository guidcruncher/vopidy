import { HttpAuth } from "@/core/http/"
import { PagedItems } from "@/core/paging"
import { SpotifyAuth } from "./spotifyauth"
import { SpotifyCatalog } from "./spotifycatalog"
import { filterImageUrl, getCodeImageUrl } from "./utils"

export class SpotifyLibrary {
  public async getPlaylists(nocache: boolean = false, offset: number = 0, limit: number = 20) {
    const data = []

    do {
      const url = `${process.env.SPOTIFY_API}/me/playlists?offset=${offset}&limit=${limit}&fields=items(uri),items(owner)(display_name),items(images),items(name),items(owner),items(type),next,offset,limit,total`
      let res: any = {}

      res = await HttpAuth.get(url, await this.getAuthHeaders(), !nocache)

      if (!res.ok) {
        return data
      }
      const jsondata: any = res.response
      if (!jsondata) {
        return data
        break
      }
      offset += jsondata.items.length
      for (let i = 0; i < jsondata.items.length; i++) {
        const value = jsondata.items[i]
        const item: any = {
          id: value.uri,
          image: filterImageUrl(value.images),
          name: value.name,
          owner: value.owner ? value.owner.display_name : "",
          type: value.type,
          barcodeUrl: getCodeImageUrl(value.uri),
        }
        data.push(item)
      }

      if (!jsondata.next) {
        return data
        break
      }
    } while (true)
  }

  public async getPlaylist(uri: string, offset: number, limit: number) {
    const segments = uri.split(":")
    const catalog = new SpotifyCatalog()
    const root: any = await catalog.describe(uri)
    const data = []

    if (!root) {
      return undefined
    }

    const url = `${process.env.SPOTIFY_API}/playlists/${segments[2]}/tracks?offset=${offset}&limit=${limit}&fields=items(track)(uri),items(track)(album)(name),items(track)(album)(images)items(track)(name),items(track)(type),items(track)(images),items(track)(artists),next,offset,limit,total`
    const res = await HttpAuth.get(url, await this.getAuthHeaders(), true)

    if (!res.ok) {
      return root
    }
    const jsondata = res.response
    if (!jsondata) {
      return root
    }

    for (let i = 0; i < jsondata.items.length; i++) {
      const value = jsondata.items[i]
      const item: any = {
        context: uri,
        id: value.track.uri,
        image: value.track.album ? filterImageUrl(value.track.album.images) : "",
        album: value.track.album ? value.track.album.name : "",
        name: value.track.name,
        type: value.track.type,
      }
      if (value.track.images) {
        item.image = filterImageUrl(value.track.images)
      }
      if (value.track.artists) {
        item.artist = value.track.artists.map((t) => {
          return { id: t.id, name: t.name }
        })
      }
      data.push(item)
    }

    let view = new PagedItems()
    view.offset = offset
    view.limit = limit
    view.total = jsondata.total
    view.items = data
    view.calculatePaging()
    root.content = view
    return root
  }

  public async getAlbums(offset: number = 0, limit: number = 20) {
    const index = 0
    const data = []

    do {
      const url = `${process.env.SPOTIFY_API}/me/albums?offset=${offset}&limit=${limit}&fields=items(album)(uri),items(album)(images),items(album)(name),items(album)(artists),items(album)(popularity),items(album)(type),next,offset,limit,total`
      const res = await HttpAuth.get(url, await this.getAuthHeaders(), true)

      if (!res.ok) {
        return data
      }
      const jsondata = res.response
      if (!jsondata) {
        return data
        break
      }
      offset += jsondata.items.length
      for (let i = 0; i < jsondata.items.length; i++) {
        const value = jsondata.items[i].album
        const item: any = {
          id: value.uri,
          image: value.images ? filterImageUrl(value.images) : "",
          name: value.name,
          artist: value.artists
            ? value.artists.map((t) => {
                return { id: t.id, name: t.name }
              })
            : [],
          popularity: value.popularity,
          type: value.type,
          barcodeUrl: getCodeImageUrl(value.uri),
        }
        data.push(item)
      }

      if (!jsondata.next) {
        return data
        break
      }
    } while (true)
  }

  public async getTracks(offset: number = 0, limit: number = 20) {
    const data = []

    do {
      const url = `${process.env.SPOTIFY_API}/me/tracks?offset=${offset}&limit=${limit}&fields=next,offset,limit,total,items(track)(uri),items(track)(album)(images),items(track)(is_playable),items(track)(name),items(track)(album)(name),items(track)(artists),items(track)(popularity),items(track)(type)`
      const res = await HttpAuth.get(url, await this.getAuthHeaders(), true)

      if (!res.ok) {
        return data
      }
      const jsondata = res.response
      if (!jsondata) {
        return data
        break
      }
      offset += jsondata.items.length
      for (let i = 0; i < jsondata.items.length; i++) {
        const value = jsondata.items[i].track
        const item: any = {
          id: value.uri,
          image: value.album.images ? filterImageUrl(value.album.images) : "",
          album: value.album.name,
          name: value.name,
          artist: value.artists
            ? value.artists.map((t) => {
                return { id: t.id, name: t.name }
              })
            : [],
          type: value.type,
          barcodeUrl: getCodeImageUrl(value.uri),
        }
        data.push(item)
      }

      if (!jsondata.next) {
        return data
        break
      }
    } while (true)
  }

  public async getShows(offset: number = 0, limit: number = 20) {
    const data = []

    do {
      const url = `${process.env.SPOTIFY_API}/me/shows?offset=${offset}&limit=${limit}&fields=next,offset,limit,total,items(show)(uri),items(show)(images),items(show)(name),items(show)(publisher),items(show)(description),items(show)(type)`
      const res = await HttpAuth.get(url, await this.getAuthHeaders(), true)

      if (!res.ok) {
        return data
      }
      const jsondata = res.response
      if (!jsondata) {
        return data
        break
      }

      offset += jsondata.items.length
      for (let i = 0; i < jsondata.items.length; i++) {
        const value = jsondata.items[i].show
        const item: any = {
          id: value.uri,
          image: value.images ? filterImageUrl(value.images) : "",
          name: value.name,
          publisher: value.publisher,
          description: value.description,
          type: value.type,
          barcodeUrl: getCodeImageUrl(value.uri),
        }
        data.push(item)
      }

      if (!jsondata.next) {
        return data
        break
      }
    } while (true)
  }

  public async getArtists() {
    const data = []
    let url = `${process.env.SPOTIFY_API}/me/following?type=artist`

    do {
      const res = await HttpAuth.get(url, await this.getAuthHeaders(), true)

      if (!res.ok) {
        return data
      }
      const jsondata = res.response
      if (!jsondata) {
        return data
      }
      for (let i = 0; i < jsondata.artists.items.length; i++) {
        const value = jsondata.artists.items[i]
        const item: any = {
          id: value.uri,
          type: value.type,
          image: value.images ? filterImageUrl(value.images) : "",
          name: value.name,
          popularity: value.popularity,
          genres: value.genres,
          href: value.href,
          external_urls: value.external_urls,
          barcodeUrl: getCodeImageUrl(value.uri),
        }
        data.push(item)
      }
      if (!jsondata.next) {
        return data
        break
      }
      url = jsondata.next
    } while (true)

    return data
  }

  private async getAuthHeaders() {
    return await SpotifyAuth.getAuthorization()
  }
}
