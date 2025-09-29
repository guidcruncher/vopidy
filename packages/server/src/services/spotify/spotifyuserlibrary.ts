import { CacheManager } from "@/core/cachemanager"
import { Authorization, Body, Http } from "@/core/http/"
import { logger } from "@/core/logger"
import { SpotifyAuth } from "./spotifyauth"
import { extractId, extractType } from "./utils"

export class SpotifyUserLibrary {
  public async saveToLibrary(id: string) {
    let res: any = {}

    if (extractType(id) == "artist") {
      return await this.follow(extractType(id), id)
    }

    if (await this.inLibrary(id)) {
      return true
    }

    const body = { ids: [extractId(id)] }
    const url = `${process.env.SPOTIFY_API}/me/${extractType(id)}s?ids=${extractId(id)}`

    res = await Http.NoCache().Authorize(this.getAuthHeaders).put(url, Body.json(body))

    await CacheManager.flush()
    return res
  }

  public async removeFromLibrary(id: string) {
    let res: any = {}
    if (extractType(id) == "artist") {
      return await this.unfollow(extractType(id), id)
    }

    if (!(await this.inLibrary(id))) {
      return true
    }

    const url = `${process.env.SPOTIFY_API}/me/${extractType(id)}s?ids=${extractId(id)}`
    res = await Http.NoCache().Authorize(this.getAuthHeaders).delete(url)
    await CacheManager.flush()
    return res
  }

  public async inLibrary(id: string) {
    let res: any = {}

    if (extractType(id) == "artist") {
      return await this.doesFollow(extractType(id), id)
    }

    const url = `${process.env.SPOTIFY_API}/me/${extractType(id)}s/contains?ids=${extractId(id)}`
    res = await Http.NoCache().Authorize(this.getAuthHeaders).get(url)

    if (res.ok) {
      return res.response[0]
    } else {
      logger.error("No valid response received", res)
    }
    return false
  }

  public async follow(type: string, id: string) {
    let res: any = {}

    if (await this.doesFollow(type, id)) {
      return true
    }

    const url = `${process.env.SPOTIFY_API}/me/following?type=${type}&ids=${extractId(id)}`
    res = await Http.NoCache().Authorize(this.getAuthHeaders).put(url, Body.empty())

    await CacheManager.flush()
    return res.ok
  }

  public async unfollow(type: string, id: string) {
    let res: any = {}

    if (!(await this.doesFollow(type, id))) {
      return true
    }

    const url = `${process.env.SPOTIFY_API}/me/following?type=${type}&ids=${extractId(id)}`
    res = await Http.NoCache().Authorize(this.getAuthHeaders).delete(url)

    await CacheManager.flush()
    return res.ok
  }

  public async doesFollow(type: string, id: string) {
    let res: any = {}

    const url = `${process.env.SPOTIFY_API}/me/following/contains?type=${extractType(id) ? extractType(id) : "artist"}&ids=${extractId(id)}`
    res = await Http.NoCache().Authorize(this.getAuthHeaders).get(url)

    if (res.ok) {
      return res[0]
    } else {
      logger.error("No valid response received", res)
    }

    return false
  }

  private async getAuthHeaders(): Promise<Authorization> {
    return await SpotifyAuth.getAuthorization()
  }
}
