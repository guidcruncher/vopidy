import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { TuneIn } from "@/services/tunein"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const tuneInClient = new TuneIn()

  return await tuneInClient.categories()
}

export default execute
