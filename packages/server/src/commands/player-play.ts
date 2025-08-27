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

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const spotifyClient = new Spotify()
  const tuneInClient = new TuneIn()
  const radioBrowserClient = new RadioBrowser()
  const mpdClient = new Mpd()
  const localClient = new LocalMusic()
  const streamerClient = new Streamer()

  let res = {}

  Mixer.ensureSource(message.params["source"])

  switch (message.params["source"]) {
    case "spotify":
      return await spotifyClient.playTrack(`${message.params["id"]}`)
      break
    case "tunein":
      return await tuneInClient.playTrack(`${message.params["id"]}`)
      break
    case "radiobrowser":
      return await radioBrowserClient.playTrack(`${message.params["id"]}`)
      break
    case "stream":
      return await streamerClient.playTrack(`${message.params["id"]}`)
      break
    case "library":
      return await localClient.playTrack(`${message.params["id"]}`)
      break
  }
  return ""
}

export default execute
