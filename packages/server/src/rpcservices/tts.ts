import { RpcService, ServiceModule } from "@/core/jsonrpc/types"
import { Auth } from "@/services/auth"
import { SpotifyAuth } from "@/services/spotify/spotifyauth"

class TtsService implements RpcService {
  public async login(id: string) {
    const authClient = new Auth()
    const res = await authClient.login(id)
    await SpotifyAuth.login()
    return res
  }

  public logout() {
    const authClient = new Auth()
    return authClient.logout()
  }

  public users() {
    const authClient = new Auth()
    return authClient.getAuthUsers()
  }
}

export const namespace = "tts"
export const service = new TtsService()

const module: ServiceModule = { namespace, service }
export default module
