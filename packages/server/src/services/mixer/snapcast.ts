import { JsonRpcClient } from "@/core/jsonrpc/jsonrpcclient"

export class SnapcastService {
  private client: JsonRpcClient

  constructor() {
    this.client = new JsonRpcClient("http://127.0.0.1:1780/jsonrpc")
  }

  private async setClientVolume(id: string, level: number, muted: boolean) {
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

  public async getVolume(): Promise<number> {
    return (await this.getMasterVolume()).level
  }

  public async setVolume(percentage: number): Promise<void> {
    return this.setMasterVolume(percentage, false)
  }

  public async mute(): Promise<void> {
    return this.setMasterVolume(undefined, true)
  }

  public async unmute(): Promise<void> {
    return this.setMasterVolume(undefined, false)
  }

  public async setMasterVolume(level: number, muted: boolean) {
    const res = await this.client.call("Server.GetStatus")
    for (let i = 0; i < res.server.groups.length; i++) {
      const clients = res.server.groups[i].clients
      for (let j = 0; j < clients.length; j++) {
        const client = clients[j]
        await this.setClientVolume(client.id, level, muted)
      }
    }
  }

  public async getVolumeStatus() {
    const state = await this.getMasterVolume()
    return { volume: state.level, isMuted: state.muted }
  }

  public async getMasterVolume() {
    const res = await this.client.call("Server.GetStatus")
    let data = { level: 0, muted: false }

    for (let i = 0; i < res.server.groups.length; i++) {
      const clients = res.server.groups[i].clients
      for (let j = 0; j < clients.length; j++) {
        const client = clients[j]
        data.muted = client.config.volume.muted
        data.level = client.config.volume.percent
      }
    }

    return data
  }
}
