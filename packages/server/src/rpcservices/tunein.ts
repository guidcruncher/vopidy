import { RpcService, ServiceModule } from "@/core/jsonrpc/types"
import { TuneIn } from "@/services/tunein"

class TuneInService implements RpcService {
  public async browse(id: string) {
    const tuneInClient = new TuneIn()

    if (message.params.length == 0) {
      return []
    }

    return await tuneInClient.browse(id)
  }

  public async categories() {
    const tuneInClient = new TuneIn()

    return await tuneInClient.categories()
  }

  public async describe(id: string) {
    const tuneInClient = new TuneIn()
    return await tuneInClient.describe(id)
  }
}

export const namespace = "tunein"
export const service = new TuneInService()

const module: ServiceModule = { namespace, service }
export default module
