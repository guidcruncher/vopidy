import { JsonRpcClient } from "@/core/jsonrpcclient"
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

  public static setTrack(track: any) {
    let data: any = { artist: [], album: "", name: "", title: "" }

    if (track) {
      data = {
        artist: track.artist,
        album: track.album ?? "",
        name: track.nowplaying ? track.nowplaying.streamTitle : track.name,
        title: track.name ?? "",
      }
    }

    let message = JsonRpcClient.getMessage("Stream.SetProperty", { id: "Vopidy", metadata: data })
    return SnapServer.clientSocket.send(JSON.stringify(message))
  }

  public static start() {
    SnapServer.clientSocket = new WebSocket("ws://127.0.0.1:1780/jsonrpc")

    SnapServer.clientSocket.addEventListener("message", async (event) => {
      const json = JSON.parse(event.data)
      if (json.method && json.method.includes(".On")) {
        if (!json.data) {
          json.data = {}
        }
        let message: any = {}
        message.type = `snapcast.${json.method.toLowerCase()}`
        message.data = json.params ?? {}
        message.data.source = "snapserver"
        logger.trace(`Incoming Snapserver event ${event.data}`)
        WsClientStore.broadcast(message)
      }
    })
  }
}
