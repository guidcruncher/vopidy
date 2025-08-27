import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { Auth } from "@/services/auth"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const authClient = new Auth()
  return authClient.login(message.params["id"])
}

export default execute
