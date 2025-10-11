import { RpcService, ServiceModule } from "@/core/jsonrpc/types"
import { Auth } from "@/services/auth"
import { Mixer } from "@/services/mixer/"

class AuthService implements RpcService {
  public async login(id: string) {
    const authClient = new Auth()
    const res = await authClient.login(id)
    await Mixer.ensurePlayback()
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

export const namespace = "auth"
export const service = new AuthService()

const module: ServiceModule = { namespace, service }
export default module
