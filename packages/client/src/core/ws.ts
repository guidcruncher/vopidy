import { config } from '@/config'
import { on, emit, off } from '@/composables/useeventbus'

export class ws {
  static socket: any = undefined

  public static get() {
    if (ws.socket) {
      return ws.socket
    }

    ws.socket = new WebSocket(config.wsBaseUrl())
    return ws.socket
  }

  public static send(message) {
    ws.get().send(json.stringify(message))
  }
}
