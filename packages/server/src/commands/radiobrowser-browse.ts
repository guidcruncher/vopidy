import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { RadioBrowser } from "@/services/radiobrowser"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const rbClient = new RadioBrowser()

  if (message.params.length == 0) {
    return []
  }

  return await rbClient.browse(message.params["name"], 0, 0, false)
}

export default execute
