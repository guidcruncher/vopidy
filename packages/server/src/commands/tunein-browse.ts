import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { TuneIn } from "@/services/tunein"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const tuneInClient = new TuneIn()

  if (message.params.length == 0) {
    return []
  }

  return await tuneInClient.browse(message.params["id"])
}

export default execute
