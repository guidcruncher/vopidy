import { config } from '@/config'

export class ws {
  static socket: any = undefined

  public static get() {
    ws.socket = new WebSocket(config.wsBaseUrl())
    return ws.socket
  }

  public static send(message) {
    ws.get().send(json.stringify(message))
  }
}
