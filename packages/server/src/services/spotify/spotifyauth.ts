import { Authorization, HttpAuth } from "@/core/http/"
import { getAccessTokenOnly } from "@/services/auth"

export class SpotifyAuth {
  static async getAuthorization(): Promise<Authorization> {
    const token = await this.getAccessToken()
    return { type: "Bearer", value: token }
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

    res = await HttpAuth.get(url, auth, true)

    if (!res.ok) {
      return undefined
    }
    return res.response
  }
}
