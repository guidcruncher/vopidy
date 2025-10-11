import { RpcService, ServiceModule } from "@/core/jsonrpc/types"
import { LocalMusic } from "@/services/localmusic"

class LibraryService implements RpcService {
  public async browse(dir: string) {
    const client = new LocalMusic()
    return await client.browse(dir)
  }
}

export const namespace = "library"
export const service = new LibraryService()

const module: ServiceModule = { namespace, service }
export default module
