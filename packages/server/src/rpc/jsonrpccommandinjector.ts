import { logger } from "@/core/logger"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { JsonRpcErrorResponse } from "@/rpc/jsonrpcerror"
import { JsonRpcResponse } from "@/rpc/jsonrpcresponse"
import { CommandMap } from "@/commands/commandmap"
import * as fs from "fs"
import * as path from "path"

export type JsonRpcCommand = (message: JsonRpcMessage) => {}

export const JsonRpcCommandInjector = async (message: JsonRpcMessage) => {
  if (!CommandMap[message.method]) {
    return new JsonRpcErrorResponse(-32601, "Method not found", message.id)
  }

  const commandMap = CommandMap[message.method]
  let paramMap: any = {}

  if (commandMap.params) {
    if (Array.isArray(message.params)) {
      for (let i = 0; i < commandMap.params.length; i++) {
        if (i < message.params.length) {
          paramMap[commandMap.params[i]] = message.params[i]
        } else {
          return new JsonRpcErrorResponse(-32602, "Invalid parameters", undefined)
        }
      }
    } else {
      paramMap = message.params
    }
  }
  try {
    message.params = paramMap as any
    let filename = path.resolve(path.join(__dirname, `../commands/${commandMap.import}.js`))
    if (!fs.existsSync(filename)) {
      filename = path.resolve(path.join(__dirname, `../commands/${commandMap.import}.ts`))
    }
    const executor: any = await import(filename)
    const result = await executor.execute(message)
    if (message.id) {
      if (result) {
        return new JsonRpcResponse(message.id, result)
      }

      return new JsonRpcErrorResponse(-32603, "Internal error", undefined, message.id)
    }
  } catch (err) {
    logger.error(`Error executing request id ${message.id} method ${message.method}`, err)
    return new JsonRpcErrorResponse(-32000, "Server error", err, message.id)
  }

  return undefined
}
