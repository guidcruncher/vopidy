import { RpcService, ServiceModule } from "@/core/jsonrpc/types"
import { PipeWire } from "@/core/pipewire/"

class PipewireService implements RpcService {
  public async sinks() {
    const pwClient = new PipeWire()
    return await pwClient.listSinks()
  }

  public async activestreams() {
    const pwClient = new PipeWire()
    return await pwClient.listActiveStreams()
  }

  public async activestreamsbyapp() {
    const pwClient = new PipeWire()
    return await pwClient.listActiveStreamsByApplication()
  }

  public async dump() {
    const pwClient = new PipeWire()
    return await pwClient.getSystemDump()
  }
}

export const namespace = "audio"
export const service = new PipewireService()

const module: ServiceModule = { namespace, service }
export default module
