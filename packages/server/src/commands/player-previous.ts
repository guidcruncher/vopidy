import type { JsonRpcCommand } from "@/rpc/jsonrpccommandinjector"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { Mixer } from "@/services/mixer"
import { Mpd } from "@/services/mpd"
import { Spotify } from "@/services/spotify"

export const execute: JsonRpcCommand = async (message: JsonRpcMessage) => {
  const mpdClient = new Mpd()
  const spotifyClient = new Spotify()

  switch (await Mixer.activeOutputDevice()) {
    case "tunein":
    case "stream":
    case "radiobrowser":
    case "library":
    case "mpd":
      return await mpdClient.previous()
    case "spotify":
      return await spotifyClient.previous()
  }

  return ""
}

export default execute
