import { CacheManager } from "@/core/cachemanager"
import { _fetch, _fetchCache, Authorization, http } from "@/core/http"
import { logger } from "@/core/logger"
import { PagedItems } from "@/core/paging"
import { pm2 } from "@/core/pm2"
import { WsClientStore } from "@/core/wsclientstore"
import { Auth, getAccessTokenOnly } from "@/services/auth"
import { db } from "@/services/db"
import { IMediaPlayer } from "@/services/imediaplayer"
import { Mixer } from "@/services/mixer"
import * as fs from "fs"
import { default as child_process } from "node:child_process"
import { promisify } from "node:util"
import * as path from "path"

const exec = promisify(child_process.exec)

export class Spotify implements IMediaPlayer {
  private static history: string[] = []

  private async getAuthorization(): Promise<Authorization> {
    const token = await getAccessTokenOnly()
    return { type: "Bearer", value: token }
  }

  public getCodeImageUrl(uri: string, color = "533191", whiteBar: boolean = true) {
    let barColor = "black"
    let segments = uri.split(":")
    if (whiteBar) {
      barColor = "white"
    }

    if (segments[1] == "playlist") {
      return `https://scannables.scdn.co/uri/plain/svg/${color}/${barColor}/1080/spotify:user:${uri}`
    }

    return `https://scannables.scdn.co/uri/plain/svg/${color}/${barColor}/1080/${uri}`
  }

  public getLibrespotState() {
    const filename = path.join(process.env.LIBRESPOT_CONFIG, "state.json")

    if (fs.existsSync(filename)) {
      return JSON.parse(fs.readFileSync(filename, "utf8"))
    }

    return {
      device_id: "",
      event_manager: null,
      credentials: {
        username: "",
        data: "",
      },
    }
  }

  public setLibrespotState(state: any) {
    const filename = path.join(process.env.LIBRESPOT_CONFIG, "state.json")

    if (fs.existsSync(filename)) {
      fs.copyFileSync(filename, filename + ".bak")
    }

    fs.writeFileSync(filename, JSON.stringify(state), "utf8")
  }

  public async getDevices(name: string = "") {
    let accessToken = await getAccessTokenOnly()
    let res: any = {}
    const url = `https://api.spotify.com/v1/me/player/devices`
    res = await _fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.devices) {
      return undefined
    }

    if (name == "") {
      return res.devices
    }

    return res.devices.filter((dev) => dev.name == name)
  }

  public async connectToLibRespotWithToken() {
    const authClient = new Auth()
    const auth = authClient.loadAuthState()
    logger.trace(`Connecting to Librespot with token ${auth.auth.access_token}`)
    return await exec("/usr/local/bin/pm2base.sh restart go-librespot", {
      env: { SPOTIFY_USERNAME: auth.profile.display_name, SPOTIFY_TOKEN: auth.auth.access_token },
    })
  }

  public async login() {
    const accessToken = await getAccessTokenOnly()
    return await this.connectToLibRespot("Vopidy", accessToken, true)
  }

  public async connectToLibRespot(
    name: string,
    accessToken: string,
    forceReconnect: boolean = false,
  ) {
    let state = this.getLibrespotState()
    let pstate = Mixer.getPlaybackState()
    logger.warn("Connecting to go-librespot")
    if (process.env.GOLIBRESPOT_CREDENTIAL_TYPE.toString() == "spotify_token") {
      logger.debug("Connecting via spotify token credentials")
      await this.connectToLibRespotWithToken()
      return "CONNECTED"
    }

    if (state.device_id == "") {
      logger.error("Vopidy Librespot instance not found")
      return "NOTFOUND"
    }

    let res: any = {}
    const url = `https://api.spotify.com/v1/me/player`
    logger.debug("Connecting to " + state.device_id)

    res = await _fetch(url, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ device_ids: [state.device_id] }),
    })

    if (!res) {
      logger.error(`Error connecting to Librespot ${res.status} ${res.statipusText}`)
      return "ERROR"
    }

    Mixer.setPlaybackState({ librespot: state.device_id })

    return "OK"
  }

  public async getProfile() {
    let accessToken = await getAccessTokenOnly()
    return await this.getProfileByToken(accessToken)
  }

  public async getProfileByToken(accessToken) {
    let res: any = {}
    let count = 0
    const url = `https://api.spotify.com/v1/me`
    res = await _fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res) {
      return undefined
    }

    return res
  }

  private async getLocalApi() {
    const url = process.env.GOLIBRESPOT_API.toString()

    try {
      const res = await fetch(url)

      return url
    } catch (err) {
      logger.error("Error connexting to  Librespot", err)
      await this.connectToLibRespotWithToken()
    }

    return url
  }

  public async playTrackFile(filename: string) {
    return await this.playTrack(filename)
  }
  public async playTrackUrl(url: string) {
    return await this.playTrack(url)
  }

  public async playTrack(id: string) {
    const url = `${await this.getLocalApi()}/player/play`
    const body = { uri: id, skip_to_uri: "", paused: false }
    const res = await http.post(url, http.JsonBody(body))
    const item = await this.describe(id)
    db.addToPlaybackHistory("spotify", item)
    Mixer.savePlaybackTrack("spotify", id)
    WsClientStore.broadcast({
      type: "track-changed",
      data: { uri: id, source: "spotify" },
    })
    let status: any = await this.getStatus()
    //    if (status.paused) {
    //      await this.resume()
    //      status.paused = false
    //    }
    return status
  }

  public async previous() {
    const url = `${await this.getLocalApi()}/player/prev`

    const res = await http.post(url, http.EmptyBody())
    if (!res) {
      return undefined
    }
    return await this.getStatus()
  }

  public async next() {
    const url = `${await this.getLocalApi()}/player/next`

    const res = await http.post(url, http.JsonBody({}))
    if (!res) {
      return undefined
    }
    return await this.getStatus()
  }

  public async pause() {
    const url = `${await this.getLocalApi()}/player/pause`
    const res = await http.post(url, http.EmptyBody())
    if (!res) {
      return undefined
    }
    return await this.getStatus()
  }

  public async resume() {
    const url = `${await this.getLocalApi()}/player/resume`
    const res = await http.post(url, http.EmptyBody())
    if (!res) {
      return undefined
    }
    return await this.getStatus()
  }

  public async stop() {
    Mixer.removePlaybackState()
    await pm2.restartGoLibRespot()
    return await this.getStatus()
  }

  private async getCurrentTrackPosition(uri: string) {
    const accessToken = await getAccessTokenOnly()
    let data: any = {}
    const url = `https://api.spotify.com/v1/me/player?fields=item(duration_ms),progress_ms`
    const res = await _fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res) {
      return {}
    }

    if (!res.item) {
      return { duration: 0, progress: res.progress_ms }
    }
    const state = { duration: res.item.duration_ms, progress: res.progress_ms }
    return state
  }

  public async getStatus() {
    const url = `${await this.getLocalApi()}/status`
    let res: any = await http.get(url)
    let track: any = {}

    if (res.status == 204) {
      const accessToken = await getAccessTokenOnly()
      res = await http.get(url)
    }

    if (!res.ok) {
      logger.error(res)
      return undefined
    }

    const json = res.response
    if (json.track) {
      const parts = json.track.uri.split(":")
      switch (parts[1]) {
        case "track":
          track = await this.getTrack(parts[2])
          break
        case "episode":
          track = await this.getEpisode(parts[2])
          break
      }

      json.duration = json.track.duration
      json.position = await this.getCurrentTrackPosition(json.track.id)
      if ((json.position.duration ?? 0) == 0) {
        json.position.duration = json.duration
      }

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

  public async mute() {
    await this.setVolume(0)
    return await this.getStatus()
  }

  public async setVolume(volume: number) {
    const url = `${await this.getLocalApi()}/player/volume`
    const body = { volume: volume, relative: false }

    const res = await http.post(url, http.JsonBody(body))
    if (!res.ok) {
      return undefined
    }
    return await this.getStatus()
  }

  public async getVolume() {
    const url = `${await this.getLocalApi()}/player/volume`
    const res = await http.get(url)
    if (!res.ok) {
      return undefined
    }
    return await this.getStatus()
  }

  private getImageUrl(img: any[]) {
    if (!img || img.length <= 0) {
      return ""
    }
    const sorted = img.sort((a, b) => {
      return b.width - a.width
    })
    return sorted[0].url
  }

  public async describe(id: string) {
    const accessToken = await getAccessTokenOnly()
    let url = ""
    const parts = id.split(":")
    switch (parts[1]) {
      case "track":
        url = `https://api.spotify.com/v1/tracks/${parts[2]}?fields=uri,album(images),is_playable,name,artists,album(name),album(uri),popularity,type `
        break
      case "album":
        url = `https://api.spotify.com/v1/albums/${parts[2]}?fields=uri,images,name,artists,popularity,type`
        break
      case "show":
        url = `https://api.spotify.com/v1/shows/${parts[2]}?fields=uri,images,name,publisher,description,type`
        break
      case "episode":
        url = `https://api.spotify.com/v1/episodes/${parts[2]}?fields=uri,images,show(name),name,show(publisher),show(uri),type`
        break
      case "playlist":
        url = `https://api.spotify.com/v1/playlists/${parts[2]}?fields=uri,images,name,owner,type`
        break
    }

    logger.warn(id, url)
    const res = await _fetchCache(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res) {
      return {}
    }
    const value = res
    if (!value) {
      return {}
    }

    switch (parts[1]) {
      case "track":
        return {
          context: value.album.uri,
          id: value.uri,
          image: this.getImageUrl(value.album.images),
          is_playable: value.is_playable,
          name: value.name,
          artist: value.artists
            ? value.artists.map((t) => {
                return { id: t.id, name: t.name }
              })
            : [],
          popularity: value.popularity,
          type: value.type,
          barcodeUrl: this.getCodeImageUrl(value.uri),
        }
        break
      case "album":
        return {
          context: value.uri,
          id: value.uri,
          image: this.getImageUrl(value.images),
          name: value.name,
          artist: value.artists
            ? value.artists.map((t) => {
                return { id: t.id, name: t.name }
              })
            : [],
          popularity: value.popularity,
          type: value.type,
          barcodeUrl: this.getCodeImageUrl(value.uri),
        }
        break
      case "show":
        return {
          context: value.uri,
          id: value.uri,
          image: this.getImageUrl(value.images),
          name: value.name,
          artist: [{ name: value.publisher }],
          publisher: value.publisher,
          description: value.description,
          type: value.type,
          barcodeUrl: this.getCodeImageUrl(value.uri),
        }
        break
      case "playlist":
        return {
          context: value.uri,
          id: value.uri,
          image: this.getImageUrl(value.images),
          name: value.name,
          owner: value.owner ? value.owner.display_name : "",
          type: value.type,
          barcodeUrl: this.getCodeImageUrl(value.uri),
        }
        break
      case "episode":
        return {
          context: value.show.uri,
          id: value.uri,
          image: this.getImageUrl(value.images),
          album: value.show.nane,
          name: value.name,
          artist: [{ name: value.show.publisher }],
          type: value.type,
          barcodeUrl: this.getCodeImageUrl(value.uri),
          publisher: value.show.publisher,
        }
        break
    }
  }

  public async getPlaylists(nocache: boolean = false, offset: number = 0, limit: number = 20) {
    const accessToken = await getAccessTokenOnly()
    const data = []

    do {
      const url = `https://api.spotify.com/v1/me/playlists?offset=${offset}&limit=${limit}&fields=items(uri),items(owner)(display_name),items(images),items(name),items(owner),items(type),next,offset,limit,total`
      let res = {}

      if (nocache) {
        res = await _fetch(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      } else {
        res = await _fetchCache(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      }

      if (!res) {
        return data
      }
      const jsondata: any = res
      if (!jsondata) {
        return data
        break
      }
      offset += jsondata.items.length
      for (let i = 0; i < jsondata.items.length; i++) {
        const value = jsondata.items[i]
        const item: any = {
          id: value.uri,
          image: this.getImageUrl(value.images),
          name: value.name,
          owner: value.owner ? value.owner.display_name : "",
          type: value.type,
          barcodeUrl: this.getCodeImageUrl(value.uri),
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
    const accessToken = await getAccessTokenOnly()
    const segments = uri.split(":")
    const root: any = await this.describe(uri)
    const data = []

    if (!root) {
      return undefined
    }

    const url = `https://api.spotify.com/v1/playlists/${segments[2]}/tracks?offset=${offset}&limit=${limit}&fields=items(track)(uri),items(track)(album)(name),items(track)(album)(images)items(track)(name),items(track)(type),items(track)(images),items(track)(artists),next,offset,limit,total`
    const res = await _fetchCache(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res) {
      return root
    }
    const jsondata = res
    if (!jsondata) {
      return root
    }

    for (let i = 0; i < jsondata.items.length; i++) {
      const value = jsondata.items[i]
      const item: any = {
        context: uri,
        id: value.track.uri,
        image: value.track.album ? this.getImageUrl(value.track.album.images) : "",
        album: value.track.album ? value.track.album.name : "",
        name: value.track.name,
        type: value.track.type,
      }
      if (value.track.images) {
        item.image = this.getImageUrl(value.track.images)
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
    const accessToken = await getAccessTokenOnly()
    const index = 0
    const data = []

    do {
      const url = `https://api.spotify.com/v1/me/albums?offset=${offset}&limit=${limit}&fields=items(album)(uri),items(album)(images),items(album)(name),items(album)(artists),items(album)(popularity),items(album)(type),next,offset,limit,total`
      const res = await _fetchCache(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!res) {
        return data
      }
      const jsondata = res
      if (!jsondata) {
        return data
        break
      }
      offset += jsondata.items.length
      for (let i = 0; i < jsondata.items.length; i++) {
        const value = jsondata.items[i].album
        const item: any = {
          id: value.uri,
          image: value.images ? this.getImageUrl(value.images) : "",
          name: value.name,
          artist: value.artists
            ? value.artists.map((t) => {
                return { id: t.id, name: t.name }
              })
            : [],
          popularity: value.popularity,
          type: value.type,
          barcodeUrl: this.getCodeImageUrl(value.uri),
        }
        data.push(item)
      }

      if (!jsondata.next) {
        return data
        break
      }
    } while (true)
  }

  public async getAlbum(uri: string) {
    const segs = uri.split(":")
    const accessToken = await getAccessTokenOnly()
    let data: any = {}
    const url = `https://api.spotify.com/v1/albums/${segs[2]}?fields=uri,images,name,artists,popularity,type,tracks(next),tracks(offset),tracks(limit),tracks(total),tracks(items)(uri),tracks(items)(album)(images),tracks(items)(is_playable),tracks(items)(name),tracks(items)(artists),tracks(items)(popularity),tracks(items)(type)`
    const res = await _fetchCache(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res) {
      return data
    }
    const value = res
    if (!value) {
      return data
    }

    data = {
      id: value.uri,
      image: value.images ? this.getImageUrl(value.images) : "",
      name: value.name,
      artist: value.artists
        ? value.artists.map((t) => {
            return { id: t.id, name: t.name }
          })
        : [],
      popularity: value.popularity,
      type: value.type,
      barcodeUrl: this.getCodeImageUrl(value.uri),
      items: [],
    }

    let tracks = value.tracks
    do {
      if (!tracks || !tracks.items) {
        const res = await _fetchCache(tracks.next, {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (!res) {
          break
        }
        const value = res
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

  public async getShows(offset: number = 0, limit: number = 20) {
    const accessToken = await getAccessTokenOnly()
    const data = []

    do {
      const url = `https://api.spotify.com/v1/me/shows?offset=${offset}&limit=${limit}&fields=next,offset,limit,total,items(show)(uri),items(show)(images),items(show)(name),items(show)(publisher),items(show)(description),items(show)(type)`
      const res = await _fetchCache(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res) {
        return data
      }
      const jsondata = res
      if (!jsondata) {
        return data
        break
      }

      offset += jsondata.items.length
      for (let i = 0; i < jsondata.items.length; i++) {
        const value = jsondata.items[i].show
        const item: any = {
          id: value.uri,
          image: value.images ? this.getImageUrl(value.images) : "",
          name: value.name,
          publisher: value.publisher,
          description: value.description,
          type: value.type,
          barcodeUrl: this.getCodeImageUrl(value.uri),
        }
        data.push(item)
      }

      if (!jsondata.next) {
        return data
        break
      }
    } while (true)
  }

  public async getTrack(id: string) {
    if (!id || id == "") {
      return {}
    }
    const accessToken = await getAccessTokenOnly()

    const url = `https://api.spotify.com/v1/tracks/${this.extractId(id)}?fields=uri,album(images),is_playable,name,album(name),artists,popularity,album(uri),type`
    const res = await _fetchCache(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res) {
      return {}
    }
    const value = res
    if (!value) {
      return {}
    }
    const item: any = {
      context: value.album.uri,
      id: value.uri,
      image: value.album.images ? this.getImageUrl(value.album.images) : "",
      album: value.album.name,
      name: value.name,
      artist: value.artists
        ? value.artists.map((t) => {
            return { id: t.id, name: t.name }
          })
        : [],
      type: value.type,
      barcodeUrl: this.getCodeImageUrl(value.uri),
    }
    return item
  }

  public async getEpisode(id: string) {
    if (!id || id == "") {
      return {}
    }
    const accessToken = await getAccessTokenOnly()

    const url = `https://api.spotify.com/v1/episodes/${this.extractId(id)}?fields=uri,images,show(name),name,show(publisher),show(uri),type`
    const res = await _fetchCache(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res) {
      return {}
    }
    const value = res
    if (!value) {
      return {}
    }
    const item: any = {
      context: value.show.uri,
      id: value.uri,
      image: value.images ? this.getImageUrl(value.images) : "",
      album: value.show.name,
      name: value.name,
      artist: [{ name: value.show.publisher }],
      type: value.type,
      barcodeUrl: this.getCodeImageUrl(value.uri),
    }
    return item
  }

  public async getTracks(offset: number = 0, limit: number = 20) {
    const accessToken = await getAccessTokenOnly()
    const data = []

    do {
      const url = `https://api.spotify.com/v1/me/tracks?offset=${offset}&limit=${limit}&fields=next,offset,limit,total,items(track)(uri),items(track)(album)(images),items(track)(is_playable),items(track)(name),items(track)(album)(name),items(track)(artists),items(track)(popularity),items(track)(type)`
      const res = await _fetchCache(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res) {
        return data
      }
      const jsondata = res
      if (!jsondata) {
        return data
        break
      }
      offset += jsondata.items.length
      for (let i = 0; i < jsondata.items.length; i++) {
        const value = jsondata.items[i].track
        const item: any = {
          id: value.uri,
          image: value.album.images ? this.getImageUrl(value.album.images) : "",
          album: value.album.name,
          name: value.name,
          artist: value.artists
            ? value.artists.map((t) => {
                return { id: t.id, name: t.name }
              })
            : [],
          type: value.type,
          barcodeUrl: this.getCodeImageUrl(value.uri),
        }
        data.push(item)
      }

      if (!jsondata.next) {
        return data
        break
      }
    } while (true)
  }

  public async getQueue() {
    const accessToken = await getAccessTokenOnly()
    const data = []

    const url = `https://api.spotify.com/v1/me/player/queue`
    const res = await _fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res) {
      return data
    }
    const jsondata = res
    if (!jsondata) {
      return data
    }

    jsondata.queue.forEach((value) => {
      switch (value.type) {
        case "track":
          data.push({
            id: value.uri,
            image: value.album.images ? this.getImageUrl(value.album.images) : "",
            album: value.album.name,
            name: value.name,
            artist: value.artists
              ? value.artists.map((t) => {
                  return { id: t.id, name: t.name }
                })
              : [],
            type: value.type,
            barcodeUrl: this.getCodeImageUrl(value.uri),
          })
          break
        case "episode":
          data.push({
            id: value.uri,
            image: value.images ? this.getImageUrl(value.images) : "",
            album: value.show.nane,
            name: value.name,
            artist: [{ name: value.show.publisher }],
            type: value.type,
            barcodeUrl: this.getCodeImageUrl(value.uri),
          })
      }
    })

    return data
  }

  public async getNewAlbums(offset: number = 0, limit: number = 50) {
    const accessToken = await getAccessTokenOnly()
    const index = 0
    const data = []

    const url = `https://api.spotify.com/v1/browse/new-releases?offset=${offset}&limit=${limit}&fields=albums(items)(uri),albums(items)(images),albums(items)(name),albums(items)(artists),albums(items)(popularity),albums(items)(type),next,offset,limit,total`
    const res = await _fetchCache(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res) {
      return data
    }
    const jsondata = res
    if (!jsondata) {
      return data
    }
    offset += jsondata.albums.items.length
    for (let i = 0; i < jsondata.albums.items.length; i++) {
      const value = jsondata.albums.items[i]
      const item: any = {
        id: value.uri,
        image: value.images ? this.getImageUrl(value.images) : "",
        name: value.name,
        artist: value.artists
          ? value.artists.map((t) => {
              return { id: t.id, name: t.name }
            })
          : [],
        popularity: value.popularity,
        type: value.type,
        barcodeUrl: this.getCodeImageUrl(value.uri),
      }
      data.push(item)
    }

    return data
  }

  private extractId(id: string) {
    if (!id) {
      return ""
    }
    if (id.includes(":")) {
      return id.split(":")[2]
    }

    return id
  }

  public async getArtistsTopTracks(id: string) {
    if (!id || id == "") {
      return []
    }
    const accessToken = await getAccessTokenOnly()
    const url = `https://api.spotify.com/v1/artists/${this.extractId(id)}/top-tracks?fields=next,offset,limit,total,tracks(uri),tracks(album)(images),tracks(is_playable),tracks(name),tracks(artists),tracks(popularity),tracks(type)`
    const data = []

    const res = await _fetchCache(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res) {
      return data
    }
    const jsondata = res
    if (!jsondata) {
      return data
    }
    for (let i = 0; i < jsondata.tracks.length; i++) {
      const value = jsondata.tracks[i]
      const item: any = {
        id: value.uri,
        image: value.album.images ? this.getImageUrl(value.album.images) : "",
        album: value.album.name,
        name: value.name,
        artist: value.artists
          ? value.artists.map((t) => {
              return { id: t.id, name: t.name }
            })
          : [],
        type: value.type,
        barcodeUrl: this.getCodeImageUrl(value.uri),
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

    const url = `https://api.spotify.com/v1/artists/${this.extractId(id)}/albums?offset=${offset}&limit=${limit}&fields=next,offset,limit,total,items(uri),items(images),items(name),items(artists),items(popularity),items(type),items(album_type)`
    const res = await _fetchCache(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res) {
      return data
    }
    const jsondata = res
    if (!jsondata) {
      return data
    }
    offset += jsondata.items.length
    for (let i = 0; i < jsondata.items.length; i++) {
      const value = jsondata.items[i]
      const item: any = {
        id: value.uri,
        image: value.images ? this.getImageUrl(value.images) : "",
        name: value.name,
        album_type: value.album_type,
        artist: value.artists
          ? value.artists.map((t) => {
              return { id: t.id, name: t.name }
            })
          : [],
        popularity: value.popularity,
        type: value.type,
        barcodeUrl: this.getCodeImageUrl(value.uri),
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
    const url = `https://api.spotify.com/v1/shows/${segments[2]}/episodes?offset=${offset}&limit=${limit}&fields=next,offset,limit,total,items(uri),items(images),items(description),items(name),items(publisher),items(type),`
    const res = await _fetchCache(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res) {
      return root
    }
    const jsondata = res

    offset += jsondata.items.length
    for (let i = 0; i < jsondata.items.length; i++) {
      const value = jsondata.items[i]
      const item: any = {
        context: id,
        id: value.uri,
        image: value.images ? this.getImageUrl(value.images) : "",
        name: value.name,
        publisher: value.publisher,
        description: value.description,
        type: value.type,
        barcodeUrl: this.getCodeImageUrl(value.uri),
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
    const url = `https://api.spotify.com/v1/artists/${this.extractId(id)}`
    const res = await _fetchCache(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res) {
      return data
    }
    const value = res
    if (!value) {
      return data
    }

    const tracks = await this.getArtistsTopTracks(id)
    const albums = await this.getArtistAlbums(id)

    data = {
      id: value.uri,
      type: value.type,
      barcodeUrl: this.getCodeImageUrl(value.uri),
      image: value.images ? this.getImageUrl(value.images) : "",
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

  public async getArtists() {
    const accessToken = await getAccessTokenOnly()
    const data = []
    let url = `https://api.spotify.com/v1/me/following?type=artist`
    do {
      const res = await _fetchCache(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res) {
        return data
      }
      const jsondata = res
      if (!jsondata) {
        return data
      }
      for (let i = 0; i < jsondata.artists.items.length; i++) {
        const value = jsondata.artists.items[i]
        const item: any = {
          id: value.uri,
          type: value.type,
          image: value.images ? this.getImageUrl(value.images) : "",
          name: value.name,
          popularity: value.popularity,
          genres: value.genres,
          href: value.href,
          external_urls: value.external_urls,
          barcodeUrl: this.getCodeImageUrl(value.uri),
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

  private chunkArray(array, chunkSize) {
    return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, index) =>
      array.slice(index * chunkSize, (index + 1) * chunkSize),
    )
  }

  public async createPlaylist(name: string, uris: string[], description: string = "") {
    logger.log("createPlaylist")

    const accessToken = await this.getAuthorization()
    let lists = await this.getPlaylists(true)
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
      const profile = await this.getProfile()
      const data = []
      url = `https://api.spotify.com/v1/users/${profile.id}/playlists`
      const body = {
        name: name,
        description: description == "" ? name : description,
        public: false,
      }
      const res = await http.post(url, http.JsonBody(body), accessToken)
      let id = ""

      if (res.ok) {
        lists = await this.getPlaylists(true)
        list = lists.find((l) => {
          return l.name == name
        })
        id = list.id.split(":")[2]
        logger.log(`created list id ${id}`)
      }
    }

    logger.log(`list id ${id}`)
    if (id != "") {
      const chunks = this.chunkArray(uris, 50)

      logger.log(`saving ${chunks.length} chunks`)
      for (const chunk of chunks) {
        let chunkurl = `https://api.spotify.com/v1/playlists/${id}/tracks`
        const chunkres = await http.post(chunkurl, http.JsonBody({ uris: chunk }), accessToken)
      }

      await CacheManager.flush()
    }

    return id
  }

  public async seek(position: number) {
    const url = `${await this.getLocalApi()}/player/seek`
    const body = { position: position * 1000, relative: false }
    const res = await http.post(url, http.JsonBody(body))
    WsClientStore.broadcast({
      type: "track-seeked",
      data: { position: position, source: "spotify" },
    })
    let status: any = await this.getStatus()
    return status
  }

  public async saveToLibrary(id: string) {
    let accessToken = await getAccessTokenOnly()
    let res: any = {}
    let segments = id.split(":")

    if (segments[1] == "artist") {
      return await this.follow(segments[1], id)
    }

    if (await this.inLibrary(id)) {
      return true
    }

    const getId = () => {
      return segments.length == 3 ? segments[2] : id
    }
    const body = { ids: [getId()] }
    const url = `https://api.spotify.com/v1/me/${segments[1]}s?ids=${getId()}`
    res = await _fetch(url, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    })

    await CacheManager.flush()
    return res
  }

  public async removeFromLibrary(id: string) {
    let accessToken = await getAccessTokenOnly()
    let res: any = {}
    let segments = id.split(":")
    if (segments[1] == "artist") {
      return await this.unfollow(segments[1], id)
    }

    if (!(await this.inLibrary(id))) {
      return true
    }

    const getId = () => {
      return segments.length == 3 ? segments[2] : id
    }
    const url = `https://api.spotify.com/v1/me/${segments[1]}s?ids=${getId()}`
    res = await _fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    })

    await CacheManager.flush()
    return res
  }

  public async inLibrary(id: string) {
    let accessToken = await getAccessTokenOnly()
    let res: any = {}
    let segments = id.split(":")

    if (segments[1] == "artist") {
      return await this.doesFollow(segments[1], id)
    }

    const getId = () => {
      return segments.length == 3 ? segments[2] : id
    }
    const url = `https://api.spotify.com/v1/me/${segments[1]}s/contains?ids=${getId()}`
    res = await _fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (res) {
      return res[0]
    } else {
      logger.error("No valid response received", res)
    }
    return false
  }

  public async follow(type: string, id: string) {
    let accessToken = await getAccessTokenOnly()
    let res: any = {}
    let segments = id.split(":")
    const getId = () => {
      return segments.length == 3 ? segments[2] : id
    }

    if (await this.doesFollow(type, id)) {
      return true
    }

    const url = `https://api.spotify.com/v1/me/following?type=${type}&ids=${getId()}`
    res = await _fetch(url, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    })

    await CacheManager.flush()
    return res.ok
  }

  public async unfollow(type: string, id: string) {
    let accessToken = await getAccessTokenOnly()
    let res: any = {}
    let segments = id.split(":")

    if (!(await this.doesFollow(type, id))) {
      return true
    }

    const getId = () => {
      return segments.length == 3 ? segments[2] : id
    }
    const url = `https://api.spotify.com/v1/me/following?type=${type}&ids=${getId()}`
    res = await _fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    })

    await CacheManager.flush()
    return res.ok
  }

  public async doesFollow(type: string, id: string) {
    let accessToken = await getAccessTokenOnly()
    let res: any = {}
    let segments = id.split(":")
    const getId = () => {
      return segments.length == 3 ? segments[2] : id
    }
    const url = `https://api.spotify.com/v1/me/following/contains?type=${segments[1] ? segments[1] : "artist"}&ids=${getId()}`
    res = await _fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (res) {
      return res[0]
    } else {
      logger.error("No valid response received", res)
    }

    return false
  }
}
