import { LocalMusic } from "@/services/localmusic"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { Mpd } from "@/services/mpd"
import { Spotify } from "@/services/spotify"
import { RadioBrowser } from "@/services/radiobrowser"
import { TuneIn } from "@/services/tunein"
import { Mixer } from "@/services/mixer"
import { WsClientStore } from "@/core/wsclientstore"
import { db } from "@/services/db"
import { Streamer } from "@/services/streamer"
import { tts } from "@/services/tts"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const ttsClient = new tts()
  let res = {}

  return await ttsClient.speak(message.params["lang"], message.params["text"])
}

export default execute
