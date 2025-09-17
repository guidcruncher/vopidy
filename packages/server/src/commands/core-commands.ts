import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { CommandMap } from "./commandmap"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const res = {}
  Object.keys(CommandMap)
    .sort()
    .forEach((method) => {
      const item = CommandMap[method]
      res[method] = { params: item.params, help: item.help }
    })

  return res
}

export default execute
