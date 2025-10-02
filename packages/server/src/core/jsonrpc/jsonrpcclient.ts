import { logger } from "@/core/logger"
import { JsonRpcRequest, JsonRpcResponse } from "./types"

export class JsonRpcClientError extends Error {
  constructor(
    message: string,
    public code?: number,
    public data?: any,
  ) {
    super(message)
    this.name = "JsonRpcClientError"
  }
}

export class JsonRpcClient {
  private url: string
  private requestIdCounter: number

  constructor(url: string) {
    this.url = url
    this.requestIdCounter = 1 // Simple counter for request IDs
  }

  private randomInt(max: number = 65535) {
    const min = Math.ceil(1)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * Generates a sequential unique ID for the JSON-RPC request.
   * @returns A unique request ID.
   */
  private generateId(): number {
    return this.requestIdCounter++
  }

  public async call<T = any>(
    method: string,
    params?: any[] | Record<string, any>,
    id: number | string | null = this.generateId(),
  ): Promise<T> {
    const request: JsonRpcRequest = {
      jsonrpc: "2.0",
      method: method,
      params: params,
      id: id,
    }

    try {
      const response = await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`)
      }

      const jsonResponse: JsonRpcResponse = await response.json()

      // 1. Check for standard JSON-RPC error response
      if ("error" in jsonResponse) {
        const { code, message, data } = jsonResponse.error
        logger.error(`JsonRPC Error: ${message}`, code, data)
        throw new JsonRpcClientError(`JsonRPC Error: ${message}`, code, data)
      }

      // 2. Check for ID mismatch (good practice)
      const successResponse = jsonResponse as JsonRpcResponse
      if (successResponse.id !== request.id) {
        logger.warn(`Response ID mismatch. Sent: ${request.id}, Received: ${successResponse.id}`)
      }

      // 3. Return the result
      return successResponse.result as T
    } catch (error) {
      // Re-throw if it's already a JsonRpcClientError
      if (error instanceof JsonRpcClientError) {
        throw error
      }
      // Handle network or JSON parsing errors
      logger.error(
        `Network or Parsing Error: ${error instanceof Error ? error.message : String(error)}`,
      )
      throw new JsonRpcClientError(
        `Network or Parsing Error: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Sends a JSON-RPC notification (no response expected).
   * This method does not wait for or check a server response.
   *
   * @param method The name of the method to invoke on the server.
   * @param params Optional parameters for the method.
   */
  public async notify(method: string, params?: any[] | Record<string, any>): Promise<void> {
    const request: JsonRpcRequest = {
      jsonrpc: "2.0",
      method: method,
      params: params,
      id: null, // ID is null for notifications
    }

    try {
      // Send the request but don't process the response body
      await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      })
    } catch (error) {
      // Log notification errors, but don't throw, as notifications are fire-and-forget
      logger.error("Error sending JSON-RPC notification:", error)
    }
  }
}
