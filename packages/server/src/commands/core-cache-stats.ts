const Memcached = require("memcached")
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  return new Promise<any>((resolve, reject) => {
    const memcached = new Memcached("127.0.0.1:11211")
    memcached.stats((err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

export default execute
