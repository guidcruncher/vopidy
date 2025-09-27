import { CacheManager } from "@/core/cachemanager"
import { Body, HttpAuth, HttpResponse } from "@/core/http/"
import { logger } from "@/core/logger"
import { PagedItems } from "@/core/paging"
import { getAccessTokenOnly } from "@/services/auth"
import { SpotifyAuth } from "./spotifyauth"
import { SpotifyLibrary } from "./spotifylibrary"
import { chunkArray, extractId, extractType, filterImageUrl, getCodeImageUrl } from "./utils"

export class SpotifyCatalog {
  private toView(id: string, res: HttpResponse) {
    if (!res.ok) {
      return {}
    }

    const value = res.response
    switch (extractType(id)) {
      case "track":
        return {
          context: value.album.uri,
          id: value.uri,
          image: filterImageUrl(value.album.images),
          is_playable: value.is_playable,
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
        break
      case "album":
        return {
          context: value.uri,
          id: value.uri,
          image: filterImageUrl(value.images),
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
        break
      case "show":
        return {
          context: value.uri,
          id: value.uri,
          image: filterImageUrl(value.images),
          name: value.name,
          artist: [{ name: value.publisher }],
          publisher: value.publisher,
          description: value.description,
          type: value.type,
          barcodeUrl: getCodeImageUrl(value.uri),
        }
        break
      case "playlist":
        return {
          context: value.uri,
          id: value.uri,
          image: filterImageUrl(value.images),
          name: value.name,
          owner: value.owner ? value.owner.display_name : "",
          type: value.type,
          barcodeUrl: getCodeImageUrl(value.uri),
        }
        break
      case "episode":
        return {
          context: value.show.uri,
          id: value.uri,
          image: filterImageUrl(value.images),
          album: value.show.nane,
          name: value.name,
          artist: [{ name: value.show.publisher }],
          type: value.type,
          barcodeUrl: getCodeImageUrl(value.uri),
          publisher: value.show.publisher,
        }
        break
      case "artist":
        break
    }

    return {}
  }

  async describe(id: string) {
    switch (extractType(id)) {
      case "track":
        return await this.getTrack(id)
      case "album":
        return await this.getAlbum(id)
      case "artist":
        return await this.getArtist(id)
      case "show":
        return await this.getShow(id, 0, 1)
      case "episode":
        return await this.getEpisode(id)
    }
    return {}
  }

  private async getAuthHeaders() {
    return await SpotifyAuth.getAuthorization()
  }

  public async getAlbum(uri: string) {
    const segs = uri.split(":")
    const accessToken = await getAccessTokenOnly()
    let data: any = {}
    const url = `${process.env.SPOTIFY_API}/albums/${segs[2]}?fields=uri,images,name,artists,popularity,type,tracks(next),tracks(offset),tracks(limit),tracks(total),tracks(items)(uri),tracks(items)(album)(images),tracks(items)(is_playable),tracks(items)(name),tracks(items)(artists),tracks(items)(popularity),tracks(items)(type)`

    const res = await HttpAuth.get(url, await this.getAuthHeaders(), true)

    if (!res.ok) {
      return data
    }
    const value = res.response
    if (!value) {
      return data
    }

    data = {
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
      items: [],
    }

    let tracks = value.tracks
    do {
      if (!tracks || !tracks.items) {
        const res = await HttpAuth.get(tracks.next, await this.getAuthHeaders(), true)
        if (!res.ok) {
          break
        }
        const value = res.response
        if (!value) {
          break
        }
        tracks = value
      }
      tracks.items.forEach((track) => {
        data.items.push({
          context: uri,
          id: track.uri,
          is_playable: track.is_playable,
          name: track.name,
          artist: value.artists
            ? value.artists.map((t) => {
                return { id: t.id, name: t.name }
              })
            : [],
          popularity: track.popularity,
          type: track.type,
        })
      })

      tracks.items = undefined
    } while (tracks.next)
    return data
  }

  public async getTrack(id: string) {
    if (!id || id == "") {
      return {}
    }
    const accessToken = await getAccessTokenOnly()

    const url = `${process.env.SPOTIFY_API}/tracks/${extractId(id)}?fields=uri,album(images),is_playable,name,album(name),artists,popularity,album(uri),type`
    const res = await HttpAuth.get(url, await this.getAuthHeaders(), true)

    if (!res.ok) {
      return {}
    }
    const value = res.response
    if (!value) {
      return {}
    }
    const item: any = {
      context: value.album.uri,
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
    return item
  }

  public async getEpisode(id: string) {
    if (!id || id == "") {
      return {}
    }
    const accessToken = await getAccessTokenOnly()

    const url = `${process.env.SPOTIFY_API}/episodes/${extractId(id)}?fields=uri,images,show(name),name,show(publisher),show(uri),type`
    const res = await HttpAuth.get(url, await this.getAuthHeaders(), true)

    if (!res.ok) {
      return {}
    }
    const value = res.response
    if (!value) {
      return {}
    }
    const item: any = {
      context: value.show.uri,
      id: value.uri,
      image: value.images ? filterImageUrl(value.images) : "",
      album: value.show.name,
      name: value.name,
      artist: [{ name: value.show.publisher }],
      type: value.type,
      barcodeUrl: getCodeImageUrl(value.uri),
    }
    return item
  }

  public async getQueue() {
    const accessToken = await getAccessTokenOnly()
    const data = []

    const url = `${process.env.SPOTIFY_API}/me/player/queue`
    const res = await HttpAuth.get(url, await this.getAuthHeaders(), true)

    if (!res.ok) {
      return data
    }
    const jsondata = res.response
    if (!jsondata) {
      return data
    }

    jsondata.queue.forEach((value) => {
      switch (value.type) {
        case "track":
          data.push({
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
          })
          break
        case "episode":
          data.push({
            id: value.uri,
            image: value.images ? filterImageUrl(value.images) : "",
            album: value.show.nane,
            name: value.name,
            artist: [{ name: value.show.publisher }],
            type: value.type,
            barcodeUrl: getCodeImageUrl(value.uri),
          })
      }
    })

    return data
  }

  public async getNewAlbums(offset: number = 0, limit: number = 50) {
    const accessToken = await getAccessTokenOnly()
    const index = 0
    const data = []

    const url = `${process.env.SPOTIFY_API}/browse/new-releases?offset=${offset}&limit=${limit}&fields=albums(items)(uri),albums(items)(images),albums(items)(name),albums(items)(artists),albums(items)(popularity),albums(items)(type),next,offset,limit,total`
    const res = await HttpAuth.get(url, await this.getAuthHeaders(), true)

    if (!res.ok) {
      return data
    }
    const jsondata = res.response
    if (!jsondata) {
      return data
    }
    offset += jsondata.albums.items.length
    for (let i = 0; i < jsondata.albums.items.length; i++) {
      const value = jsondata.albums.items[i]
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

    return data
  }

  public async getArtistsTopTracks(id: string) {
    if (!id || id == "") {
      return []
    }
    const accessToken = await getAccessTokenOnly()
    const url = `${process.env.SPOTIFY_API}/artists/${extractId(id)}/top-tracks?fields=next,offset,limit,total,tracks(uri),tracks(album)(images),tracks(is_playable),tracks(name),tracks(artists),tracks(popularity),tracks(type)`
    const data = []

    const res = await HttpAuth.get(url, await this.getAuthHeaders(), true)

    if (!res.ok) {
      return data
    }
    const jsondata = res.response
    if (!jsondata) {
      return data
    }
    for (let i = 0; i < jsondata.tracks.length; i++) {
      const value = jsondata.tracks[i]
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
    return data
  }

  public async getArtistAlbums(id: string, offset: number = 0, limit: number = 50) {
    if (!id || id == "") {
      return []
    }
    const accessToken = await getAccessTokenOnly()
    const index = 0
    const data = []

    const url = `${process.env.SPOTIFY_API}/artists/${extractId(id)}/albums?offset=${offset}&limit=${limit}&fields=next,offset,limit,total,items(uri),items(images),items(name),items(artists),items(popularity),items(type),items(album_type)`

    const res = await HttpAuth.get(url, await this.getAuthHeaders(), true)

    if (!res.ok) {
      return data
    }
    const jsondata = res.response
    if (!jsondata) {
      return data
    }
    offset += jsondata.items.length
    for (let i = 0; i < jsondata.items.length; i++) {
      const value = jsondata.items[i]
      const item: any = {
        id: value.uri,
        image: value.images ? filterImageUrl(value.images) : "",
        name: value.name,
        album_type: value.album_type,
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
    return data.sort((a, b) => {
      return b.popularity - a.popularity
    })
  }

  public async getShow(id: string, offset: number, limit: number) {
    const accessToken = await getAccessTokenOnly()
    const data = []
    const root: any = await this.describe(id)
    root.items = []
    const segments = id.split(":")
    const url = `${process.env.SPOTIFY_API}/shows/${segments[2]}/episodes?offset=${offset}&limit=${limit}&fields=next,offset,limit,total,items(uri),items(images),items(description),items(name),items(publisher),items(type),`
    const res = await HttpAuth.get(url, await this.getAuthHeaders(), true)

    if (!res.ok) {
      return root
    }
    const jsondata = res.response

    offset += jsondata.items.length
    for (let i = 0; i < jsondata.items.length; i++) {
      const value = jsondata.items[i]
      const item: any = {
        context: id,
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

    let view = new PagedItems()
    view.offset = offset
    view.limit = limit
    view.total = jsondata.total
    view.items = data
    view.calculatePaging()
    root.content = view
    return root
  }

  public async getArtist(id: string) {
    if (!id || id == "") {
      return {}
    }
    const accessToken = await getAccessTokenOnly()
    let data: any = {}
    const url = `${process.env.SPOTIFY_API}/artists/${extractId(id)}`
    const res = await HttpAuth.get(url, await this.getAuthHeaders(), true)
    if (!res.ok) {
      return data
    }
    const value = res.response
    if (!value) {
      return data
    }

    const tracks = await this.getArtistsTopTracks(id)
    const albums = await this.getArtistAlbums(id)

    data = {
      id: value.uri,
      type: value.type,
      barcodeUrl: getCodeImageUrl(value.uri),
      image: value.images ? filterImageUrl(value.images) : "",
      name: value.name,
      popularity: value.popularity,
      genres: value.genres,
      href: value.href,
      external_urls: value.external_urls,
      tracks: tracks,
      albums: albums,
    }

    return data
  }

  public async createPlaylist(name: string, uris: string[], description: string = "") {
    logger.log("createPlaylist")
    const spotifyLibrary = new SpotifyLibrary()
    let lists = await spotifyLibrary.getPlaylists(true)
    let id = ""
    let url = ""
    let list = lists.find((l) => {
      return l.name == name
    })
    if (list) {
      id = list.id.split(":")[2]
      logger.log(`existing list id ${id}`)
    }

    if (id == "") {
      logger.log("creating new list")
      const profile = await SpotifyAuth.getProfile()
      const data = []
      url = `${process.env.SPOTIFY_API}/users/${profile.id}/playlists`
      const body = {
        name: name,
        description: description == "" ? name : description,
        public: false,
      }

      const res = await HttpAuth.post(url, Body.json(body), await this.getAuthHeaders())
      let id = ""

      if (res.ok) {
        const spotifyLibrary = new SpotifyLibrary()
        lists = await spotifyLibrary.getPlaylists(true)
        list = lists.find((l) => {
          return l.name == name
        })
        id = list.id.split(":")[2]
        logger.log(`created list id ${id}`)
      }
    }

    logger.log(`list id ${id}`)
    if (id != "") {
      const chunks = chunkArray(uris, 50)

      logger.log(`saving ${chunks.length} chunks`)
      for (const chunk of chunks) {
        let chunkurl = `${process.env.SPOTIFY_API}/playlists/${id}/tracks`
        const chunkres = await HttpAuth.post(
          chunkurl,
          Body.json({ uris: chunk }),
          await this.getAuthHeaders(),
        )
      }

      await CacheManager.flush()
    }

    return id
  }
}
