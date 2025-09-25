import { logger } from "@/core/logger"
import { WsClientStore } from "@/core/wsclientstore"

export class SnapServer {
  private static clientSocket: any = undefined

  public static close() {
    if (SnapServer.clientSocket) {
      SnapServer.clientSocket.close()
      SnapServer.clientSocket = undefined
    }
  }

  public static start() {
    SnapServer.clientSocket = new WebSocket("ws://127.0.0.1:1780/jsonrpc")

    SnapServer.clientSocket.addEventListener("message", async (event) => {
      const json = JSON.parse(event.data)
      if (json.method.includes(".On")) {
        if (!json.data) {
          json.data = {}
        }
        let message: any = {}
        message.type = json.method.toLowerCase()
        message.data = json.params ?? {}
        message.data.source = "snapserver"
        logger.trace(`Incoming Snapserver event ${event.data}`)
        WsClientStore.broadcast(message)
      }
    })
  }
}
