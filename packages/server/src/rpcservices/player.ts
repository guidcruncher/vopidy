import { RpcService, ServiceModule } from "@/core/jsonrpc/types"
import { db } from "@/services/db/"
import { Mixer } from "@/services/mixer/"

class PlayerService implements RpcService {
  public async history() {
    return await db.getPlaybackHistory()
  }

  public async history_popular() {
    return await db.getPlaybackHistoryPop()
  }

  public async next() {
    let state = await Mixer.next()
    return await Mixer.getStatus()
  }

  public async pause() {
    let state = await Mixer.pause()
    return await Mixer.getStatus()
  }

  public async play(source: string, id: string) {
    let state = await Mixer.play(source, id)
    return await Mixer.getStatus()
  }

  public async previous() {
    let state = await Mixer.previous()
    return await Mixer.getStatus()
  }

  public async resume() {
    let state = await Mixer.resume()
    return await Mixer.getStatus()
  }

  public async seek(source: string, position: number) {
    let state = await Mixer.seek(position)
    return await Mixer.getStatus()
  }

  public async stop() {
    let state = await Mixer.stop()
    return await Mixer.getStatus()
  }
}

export const namespace = "player"
export const service = new PlayerService()

const module: ServiceModule = { namespace, service }
export default module
