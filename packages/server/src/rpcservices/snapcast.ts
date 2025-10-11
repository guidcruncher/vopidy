import { JsonRpcClient } from "@/core/jsonrpc/jsonrpcclient"
import { RpcService, ServiceModule } from "@/core/jsonrpc/types"

class SnapcastService implements RpcService {
  private client: JsonRpcClient

  constructor() {
    this.client = new JsonRpcClient("http://127.0.0.1:1780/jsonrpc")
  }

  public async setclientname(id: string, name: string) {
    return await this.client.call("Client.SetName", {
      id: id,
      name: name,
    })
  }

  public async setvolume(id: string, level: number, muted: boolean) {
    if (!level) {
      return await this.client.call("Client.SetVolume", {
        id: id,
        volume: { muted: muted },
      })
    } else {
      return await this.client.call("Client.SetVolume", {
        id: id,
        volume: { percent: level },
      })
    }
  }

  public async status() {
    const res = await this.client.call("Server.GetStatus")
    return res
  }
}

export const namespace = "snapcast"
export const service = new SnapcastService()

const module: ServiceModule = { namespace, service }
export default module
