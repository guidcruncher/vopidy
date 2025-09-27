import { Body, HttpAuth } from "@/core/http/"
import { SpotifyAuth } from "./spotifyauth"

export class SpotifyUserLibrary {
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
    const url = `${process.env.SPOTIFY_API}/me/${segments[1]}s?ids=${getId()}`

    res = HttpAuth.put(url, Body.json(body), await this.getAuthHeaders())

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
    const url = `${process.env.SPOTIFY_API}/me/${segments[1]}s?ids=${getId()}`
    res = HttpAuth.delete(url, await this.getAuthHeaders())
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
    const url = `${process.env.SPOTIFY_API}/me/${segments[1]}s/contains?ids=${getId()}`
    res = HttpAuth.get(url, await this.getAuthHeaders(), false)

    if (res.ok) {
      return res.response[0]
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

    const url = `${process.env.SPOTIFY_API}/me/following?type=${type}&ids=${getId()}`
    res = HttpAuth.put(url, Body.empty(), await this.getAuthHeaders())

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
    const url = `${process.env.SPOTIFY_API}/me/following?type=${type}&ids=${getId()}`
    res = HttpAuth.delete(url, await this.getAuthHeaders())

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
    const url = `${process.env.SPOTIFY_API}/me/following/contains?type=${segments[1] ? segments[1] : "artist"}&ids=${getId()}`
    res = HttpAuth.get(url, await this.getAuthHeaders(), false)

    if (res.ok) {
      return res[0]
    } else {
      logger.error("No valid response received", res)
    }

    return false
  }

  private async getAuthHeaders() {
    return await SpotifyAuth.getAuthorization()
  }
}
