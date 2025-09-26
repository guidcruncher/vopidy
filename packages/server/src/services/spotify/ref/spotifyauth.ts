import { Authorization } from "@/core/http"
import { getAccessTokenOnly } from "@/services/auth"

export class SpotifyAuth {
  async getAuthorization(): Promise<Authorization> {
    const token = await this.getAccessToken()
    return { type: "Bearer", value: token }
  }

  async getAccessToken(): Promise<string> {
    return await getAccessTokenOnly()
  }
}
