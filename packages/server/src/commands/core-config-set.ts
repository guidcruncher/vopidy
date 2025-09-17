import { ApplyConfig, Config, ConfigWriter } from "@/core/config"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  let cfg: Config = Config.load()
  let newCfg: Config = JSON.parse(JSON.stringify(cfg))

  newCfg.enableBitPerfectPlayback = message.params["config"].enableBitPerfectPlayback
  newCfg.enableRequestCache = message.params["config"].enableRequestCache
  newCfg.requestCacheLifetimeSeconds = message.params["config"].requestCacheLifetimeSeconds
  newCfg.enableIcecast = message.params["config"].enableIcecast
  newCfg.nightStartHour = message.params["config"].nightStartHour
  newCfg.nightEndHour = message.params["config"].nightEndHour
  newCfg.announceTimeHourly = message.params["config"].announceTimeHourly
  newCfg.timezone = message.params["config"].timezone
  newCfg.locale = message.params["config"].locale
  newCfg.clockType = message.params["config"].clockType

  ConfigWriter(newCfg)
  await ApplyConfig(cfg, newCfg)
  return newCfg
}

export default execute
