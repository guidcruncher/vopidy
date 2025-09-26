import { Authorization } from "@/core/http"
import { getAccessTokenOnly } from "@/services/auth"

export class SpotifyAuth {
  static async getAuthorization(): Promise<Authorization> {
    const token = await this.getAccessToken()
    return { type: "Bearer", value: token }
  }

  static async getAccessToken(): Promise<string> {
    return await getAccessTokenOnly()
  }
}
