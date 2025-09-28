import { RpcService, ServiceModule } from "@/core/jsonrpc/types"
import { Auth } from "@/services/auth"
import { SpotifyAuth } from "@/services/spotify/spotifyauth"

class SnapCastService implements RpcService {
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

export const namespace = "snapcast"
export const service = new SnapCastService()

const module: ServiceModule = { namespace, service }
export default module
