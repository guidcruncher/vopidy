import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { Mpd } from "@/services/mpd"
import { Spotify } from "@/services/spotify"
import { Mixer } from "@/services/mixer"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  return await Mixer.getStatus()
}

export default execute
