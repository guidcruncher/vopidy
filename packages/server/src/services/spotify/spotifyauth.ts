import { Authorization, Http } from "@/core/http/"
import { getAccessTokenOnly } from "@/services/auth"
import { LibrespotManager } from "./librespotmanager"

export class SpotifyAuth {
  static async getAuthorization(): Promise<Authorization> {
    const token = await this.getAccessToken()
    return { type: "Bearer", value: token }
  }

  static async login() {
    const accessToken = await getAccessTokenOnly()
    const librespot = new LibrespotManager()
    return await librespot.connect("Vopidy", accessToken, true)
  }

  static async getAccessToken(): Promise<string> {
    return await getAccessTokenOnly()
  }

  public static async getProfile() {
    let accessToken = await getAccessTokenOnly()
    return await SpotifyAuth.getProfileByToken(accessToken)
  }

  public static async getProfileByToken(accessToken) {
    let res: any = {}
    let count = 0
    const url = `${process.env.SPOTIFY_API}/me`
    const auth: Authorization = { type: "Bearer", value: accessToken }

    res = await Http.Cache().Authorize(SpotifyAuth.getAuthorization).get(url)

    if (!res.ok) {
      return undefined
    }
    return res.response
  }
}
