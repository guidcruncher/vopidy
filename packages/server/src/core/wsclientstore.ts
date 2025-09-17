import { logger } from "@/core/logger"
import { JsonRpcEvent } from "@/rpc/jsonrpcevent"

export class WsClientStore {
  private static wsclients

  private static ensureStore() {
    if (WsClientStore.wsclients) {
      return
    }
    WsClientStore.wsclients = []
  }

  public static add(rawWs) {
    WsClientStore.ensureStore()
    WsClientStore.wsclients.push(rawWs)
  }

  public static remove(rawWs) {
    WsClientStore.ensureStore()
    WsClientStore.wsclients = WsClientStore.wsclients.filter((client) => client !== rawWs)
  }

  public static broadcast(json) {
    WsClientStore.ensureStore()
    const ev = new JsonRpcEvent()
    ev.event = json.type
    ev.data = json.data
    logger.trace(`Emitting event to listening clients ${JSON.stringify(ev)}`)
    logger.trace(`Client count: ${WsClientStore.wsclients.length}`)
    WsClientStore.wsclients.forEach((client) => {
      try {
        client.send(JSON.stringify(ev))
      } catch (err) {
        logger.error("Error in socket broadcast", err)
      }
    })
  }
}
