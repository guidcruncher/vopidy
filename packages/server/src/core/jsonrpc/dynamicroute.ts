// src/index.ts

import { logger } from "@/core/logger"
import { WsClientStore } from "@/core/wsclientstore"
import { createNodeWebSocket } from "@hono/node-ws"
import { Hono } from "hono"
import * as path from "path"
import { dirname } from "path"
import { fileURLToPath } from "url"
import { registry } from "./dynamicserviceregistry"
import { JsonRpcErrorCode, JsonRpcRequest, JsonRpcResponse } from "./types"

function getDirname(importMetaUrl) {
  const filename = fileURLToPath(importMetaUrl)
  return dirname(filename)
}

const __dirname = getDirname(import.meta.url)
export const route = new Hono()

// --- 1. Define Service Paths and Load ---
// NOTE: Use relative paths that are resolvable by your runtime (e.g., Node or Bun).
const serviceModulePaths = [path.resolve(path.join(__dirname, "../../rpcservices/"))]
// Initialize the registry asynchronously before the server starts accepting requests
async function initialize() {
  logger.debug("Initializing RPC services via dynamic import...")
  await registry.loadServices(serviceModulePaths)
}

// Initialize the services immediately
initialize().catch((err) => {
  logger.error("Failed to initialize RPC services:", err)
  process.exit(1)
})

// --- 2. JSON-RPC Logic Handler ---

async function processRpcRequest(request: JsonRpcRequest): Promise<JsonRpcResponse | null> {
  const { jsonrpc, method, params, id } = request

  if (jsonrpc !== "2.0" || typeof method !== "string") {
    return {
      jsonrpc: "2.0",
      error: {
        code: JsonRpcErrorCode.InvalidRequest,
        message: "Invalid JSON-RPC request structure.",
      },
      id: id || null,
    }
  }

  if (id === null) {
    logger.debug(`jsonrpc method ${method}`)
    registry
      .execute(method, params)
      .catch((e) => logger.error(`Error in notification ${method}:`, e))
    return null
  }

  try {
    const result = await registry.execute(method, params)
    return { jsonrpc: "2.0", result, id }
  } catch (error) {
    let code = JsonRpcErrorCode.InternalError
    let message = "Internal server error."
    let data = undefined

    // Custom error handling based on thrown object/Error
    if (typeof error === "object" && error !== null && "code" in error) {
      code = (error as any).code
      message = (error as any).message || message
      data = (error as any).data
    } else if (error instanceof Error && error.message.includes("Invalid parameters")) {
      code = JsonRpcErrorCode.InvalidParams
      message = error.message
    } else if (error instanceof Error) {
      message = error.message
      data = { stack: error.stack }
    }

    logger.error(`jsonrpc error`, { method, code, message, data })
    return { jsonrpc: "2.0", error: { code, message, data }, id }
  }
}

// --- 3. Hono Route Definition ---

route.post("/", async (c) => {
  let reqBody: any
  try {
    reqBody = await c.req.json()
  } catch (e) {
    const response: JsonRpcResponse = {
      jsonrpc: "2.0",
      error: {
        code: JsonRpcErrorCode.ParseError,
        message: "Invalid JSON was received by the server.",
      },
      id: null,
    }
    return c.json(response, 400)
  }

  if (Array.isArray(reqBody)) {
    // Batch Request
    const responses = await Promise.all(reqBody.map((r) => processRpcRequest(r as JsonRpcRequest)))
    const validResponses = responses.filter((r): r is JsonRpcResponse => r !== null)
    return c.json(validResponses)
  } else if (typeof reqBody === "object" && reqBody !== null) {
    // Single Request

    const response = await processRpcRequest(reqBody as JsonRpcRequest)

    if (response === null) {
      return c.body(null, 204) // Notification: 204 No Content
    }
    return c.json(response)
  }

  // Invalid top-level request type
  const errorResponse: JsonRpcResponse = {
    jsonrpc: "2.0",
    error: {
      code: JsonRpcErrorCode.InvalidRequest,
      message: "Request must be a single object or an array of objects.",
    },
    id: null,
  }
  return c.json(errorResponse, 400)
})

export const setupWebSocket = (app) => {
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
          let reqBody: any
          try {
            reqBody = JSON.parse(event.data.toString())
          } catch (e) {
            const response: JsonRpcResponse = {
              jsonrpc: "2.0",
              error: {
                code: JsonRpcErrorCode.ParseError,
                message: "Invalid JSON was received by the server.",
              },
              id: null,
            }
            ws.send(JSON.stringify(response))
            return
          }

          if (Array.isArray(reqBody)) {
            // Batch Request
            const responses = await Promise.all(
              reqBody.map((r) => processRpcRequest(r as JsonRpcRequest)),
            )
            const validResponses = responses.filter((r): r is JsonRpcResponse => r !== null)
            ws.send(JSON.stringify(validResponses))
            return
          } else if (typeof reqBody === "object" && reqBody !== null) {
            // Single Request
            const response = await processRpcRequest(reqBody as JsonRpcRequest)

            if (response != null) {
              ws.send(JSON.stringify(response))
              return
            }
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
