import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { Config, ConfigWriter, ApplyConfig } from "@/core/config"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  let cfg: Config = Config.load()
  let newCfg: Config = JSON.parse(JSON.stringify(cfg))

  newCfg.enableBitPerfectPlayback = message.params["config"].enableBitPerfectPlayback
  newCfg.enableRequestCache = message.params["config"].enableRequestCache
  newCfg.requestCacheLifetimeSeconds = message.params["config"].requestCacheLifetimeSeconds
  newCfg.enableIcecast = message.params["config"].enableIcecast
  ConfigWriter(newCfg)
  ApplyConfig(cfg, newCfg)
  return newCfg
}

export default execute
