import { config } from '@/config'
import { on, emit, off } from '@/composables/useeventbus'
import { ws } from '@/core/ws'

export const VopidyEventBus = () => {
  if (window._socket) {
    return
  }

  window._socket = null
  if (window._socketHandle) {
    clearInterval(window._socketHandle)
    window._socketHandle = null
  }

  window.startWebSocket = () => {
    // Create WebSocket connection.
    window._socket = ws.get()

    // Connection opened
    window._socket.addEventListener('open', (event) => {
      window._socketHandle = setInterval(sendPing, 30000)
    })

    // Listen for messages
    window._socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data)
      if (data.event) {
        emit(`vopidy.${data.event}`, data.data)
      }
    })

    window._socket.addEventListener('close', (event) => {
      // connection closed, discard old websocket and create a new one in 5s
      if (window._socketHandle) {
        clearInterval(window._socketHandle)
        window._socketHandle = null
      }
      window._socket = null
      setTimeout(window.startWebsocket, 5000)
    })

    const sendPing = () => {
      if (!window._socket) {
        return
      }
      if (!window._socket.ready != 1) {
        if (window._socketHandle) {
          clearInterval(window._socketHandle)
          window._socketHandle = null
        }
        window._socket = null
        setTimeout(window.startWebsocket, 5000)
        return
      }
      let id = Math.floor(Math.random() * (32767 - 1 + 1)) + 1
      let json = `{"jsonrpc": "2.0","id": ${id},"method": "core.ping"}`
      window._socket.send(json)
    }
  }

  window.startWebSocket()
}
