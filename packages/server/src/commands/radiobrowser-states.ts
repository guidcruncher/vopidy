import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { RadioBrowser } from "@/services/radiobrowser"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const rbClient = new RadioBrowser()

  return await rbClient.states(message.params["code"], message.params["name"])
}

export default execute
