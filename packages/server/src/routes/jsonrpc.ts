import { logger } from "@/core/logger"
import { WsClientStore } from "@/core/wsclientstore"
import { JsonRpcProcessor } from "@/rpc/jsonrpcprocessor"
import { createNodeWebSocket } from "@hono/node-ws"
import { Hono } from "hono"

export const httprpc = new Hono()

httprpc.post("/", async (c) => {
  const json = await c.req.json()
  const res = await JsonRpcProcessor(JSON.stringify(json))

  if (res) {
    return c.json(res)
  }

  return c.body("", 201)
})

export const setupWebsocket = (app) => {
  const wsrpc = new Hono()
  const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })

  wsrpc.get(
    "/",
    upgradeWebSocket((c) => {
      return {
        onOpen: (event, ws) => {
          const rawWs = ws
          logger.warn(`*** Incoming socket connection`)
          WsClientStore.add(rawWs)
        },
        onMessage: async (event, ws) => {
          //logger.trace(`*** Incoming message ${event.data}`)
          const res = await JsonRpcProcessor(event.data)
          if (res) {
            ws.send(JSON.stringify(res))
          }
        },
        onClose: (ws) => {
          const rawWs = ws
          logger.trace("Socket closed by client")
          WsClientStore.remove(rawWs)
        },
      }
    }),
  )

  return { route: wsrpc, injectWebSocket: injectWebSocket }
}
