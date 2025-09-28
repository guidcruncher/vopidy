import { logger } from "@/core/logger"
import { Hono } from "hono"
import { registry } from "./serviceregistry"
import { JsonRpcErrorCode, JsonRpcRequest, JsonRpcResponse } from "./types"

export const route = new Hono()

// --- 1. Dynamic Command Injection ---
// registry.registerService('calc', new CalculatorService());
// registry.registerService('user', new UserService()); // You can add more services later!

// --- 2. JSON-RPC Logic Handler ---

/**
 * Handles the RPC execution logic for a single request.
 */
async function processRpcRequest(request: JsonRpcRequest): Promise<JsonRpcResponse | null> {
  const { jsonrpc, method, params, id } = request

  // Basic structure validation
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

  // Notification check (id === null)
  if (id === null) {
    // Run the command but do not send a response
    logger.trace(`jsonrpc method ${method}`)
    registry
      .execute(method, params)
      .catch((e) => logger.error(`Error in notification ${method}:`, e))
    return null
  }

  try {
    logger.trace(`jsonrpc method ${method}`)
    const result = await registry.execute(method, params)
    logger.trace(`jsonrpc result ${JSON.stringify( { jsonrpc: "2.0", result, id })}`)
    return { jsonrpc: "2.0", result, id }
  } catch (error) {
    // --- Error Formatting ---
    let code = JsonRpcErrorCode.InternalError
    let message = "Internal server error."
    let data = undefined

    // Check for specific application/registry errors
    if (typeof error === "object" && error !== null && "code" in error && "message" in error) {
      code = (error as any).code
      message = (error as any).message
      data = (error as any).data
    }
    // Catch generic Errors (e.g., "Invalid parameters" from service)
    else if (error instanceof Error && error.message.includes("Invalid parameters")) {
      code = JsonRpcErrorCode.InvalidParams
      message = error.message
    }
    // Catch any other generic error
    else if (error instanceof Error) {
      message = error.message
      data = { stack: error.stack }
    }

    logger.error(`jsonrpc error ${JSON.stringify({code, message, data, id})}`)
    return {
      jsonrpc: "2.0",
      error: { code, message, data },
      id,
    }
  }
}

route.post("/", async (c) => {
  let reqBody: any
  try {
    reqBody = await c.req.json()
  } catch (e) {
    // ParseError handling
    const response: JsonRpcResponse = {
      jsonrpc: "2.0",
      error: {
        code: JsonRpcErrorCode.ParseError,
        message: "Invalid JSON was received by the server.",
      },
      id: null,
    }
    return c.json(response, 400) // 400 Bad Request
  }

  if (Array.isArray(reqBody)) {
    // Batch Request
    const responses = await Promise.all(reqBody.map((r) => processRpcRequest(r as JsonRpcRequest)))
    // Filter out null responses (notifications)
    const validResponses = responses.filter((r): r is JsonRpcResponse => r !== null)
    return c.json(validResponses)
  } else if (typeof reqBody === "object" && reqBody !== null) {
    // Single Request
    const response = await processRpcRequest(reqBody as JsonRpcRequest)

    if (response === null) {
      // Notification: 204 No Content
      return c.body(null, 204)
    }
    return c.json(response)
  }

  // Invalid request structure (not single object or array)
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
