import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { Auth } from "@/services/auth"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const authClient = new Auth()
  return authClient.logout()
}

export default execute
