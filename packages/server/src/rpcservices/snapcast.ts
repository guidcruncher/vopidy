import { RpcService, ServiceModule } from "@/core/jsonrpc/types"
import { JsonRpcClient } from "@/core/jsonrpcclient"

class SnapcastService implements RpcService {
  public async setclientname(id: string, name: string) {
    return await JsonRpcClient.request("Client.SetName", {
      id: id,
      name: name,
    })
  }

  public async setovolume(id: string, level: number, muted: boolean) {
    if (!level) {
      return await JsonRpcClient.request("Client.SetVolume", {
        id: id,
        volume: { muted: muted },
      })
    } else {
      return await JsonRpcClient.request("Client.SetVolume", {
        id: id,
        volume: { percent: level },
      })
    }
  }

  public async status() {
    return await JsonRpcClient.request("Server.GetStatus")
  }
}

export const namespace = "snapcast"
export const service = new SnapcastService()

const module: ServiceModule = { namespace, service }
export default module
