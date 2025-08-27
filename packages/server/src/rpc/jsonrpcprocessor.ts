import { JsonRpcErrorResponse } from "@/rpc/jsonrpcerror"
import { JsonRpcCommandInjector } from "@/rpc/jsonrpccommandinjector"
import { logger } from "@/core/logger"

export const JsonRpcProcessor = async (message) => {
  let json: any = {} as any
  try {
    json = JSON.parse(message)

    if (Array.isArray(json)) {
      for (let i = 0; i < json.length; i++) {
        if (!json[i].jsonrpc || !json[i].method) {
          return new JsonRpcErrorResponse(-32600, "Invalid request", undefined)
        }
        if (json[i].id) {
          return new JsonRpcErrorResponse(-32600, "Invalid request", undefined, json[i].id)
        }
      }
    } else {
      if (!json.jsonrpc || !json.method || !json.id) {
        return new JsonRpcErrorResponse(-32600, "Invalid request", undefined)
      }
    }
  } catch (err) {
    logger.error(`Error processing request`, err)
    return new JsonRpcErrorResponse(-32700, "Parser error", undefined)
  }

  if (json.id) {
    const result = await JsonRpcCommandInjector(json)
    if (result) {
      return result
    }

    return new JsonRpcErrorResponse(-32603, "Internal error", undefined)
  } else {
    let arr = []
    if (Array.isArray(json)) {
      arr = json
    } else {
      arr.push(json)
    }
    const promises = []
    for (let i = 0; i < arr.length; i++) {
      promises.push(JsonRpcCommandInjector(arr[i]))
    }

    await Promise.allSettled(promises)
  }

  return undefined
}
