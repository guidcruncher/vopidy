import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { Mpd } from "@/services/mpd"
import { Spotify } from "@/services/spotify"
import { Mixer } from "@/services/mixer"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const mpdClient = new Mpd()
  const spotifyClient = new Spotify()
  switch (await Mixer.activeOutputDevice()) {
    case "tunein":
    case "stream":
    case "radiobrowser":
    case "library":
    case "mpd":
      return await mpdClient.pause()
    case "spotify":
      return await spotifyClient.pause()
  }

  return ""
}

export default execute
