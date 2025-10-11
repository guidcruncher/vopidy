import { logger } from "@/core/logger"
import { WsClientStore } from "@/core/wsclientstore"
import { db } from "@/services/db/"
import { Mixer } from "@/services/mixer/"
import { SpotifyCatalog } from "@/services/spotify/spotifycatalog"

export class LibrespotSocket {
  private static clientSocket: any = undefined

  public static open() {
    const wsUrl = `${process.env.GOLIBRESPOT_API.toString().replaceAll("http", "ws")}/events`
    LibrespotSocket.clientSocket = new WebSocket(wsUrl)
    logger.debug(`Opening socket connection to Librespot instance ${wsUrl}`)

    LibrespotSocket.clientSocket.addEventListener("message", async (event) => {
      const json = JSON.parse(event.data)
      if (!json.data) {
        json.data = {}
      }

      logger.debug(`Incoming Librespot message "${json.type}"`)
      json.data.source = "spotify"
      switch (json.type) {
        case "playing":
          const spotifyClient = new SpotifyCatalog()
          const parts = json.data.uri.split(":")
          let track: any = {}
          switch (parts[1]) {
            case "track":
              track = await spotifyClient.getTrack(parts[2])
              break
            case "episode":
              track = await spotifyClient.getEpisode(parts[2])
              break
          }
          track.source = "spotify"
          track.uri = track.id
          let artist = track.artist.map((t) => {
            return t.name
          })
          track.artist = artist.join(", ")
          Mixer.savePlaybackTrack("spotify", track.uri)
        case "metadata":
          json.type = "track-changed"
          const mpdClient = Mixer.getMediaPlayer()
          await mpdClient.stop()
          const item = {
            source: "spotify",
            uri: json.data.uri,
            id: json.data.uri,
            image: json.data.album_cover_url,
            album: json.data.album_name,
            name: json.data.name,
            type: json.data.uri.split(":")[1],
            artist: (json.data.artist_names ?? []).join(", "),
          }
          db.addToPlaybackHistory("spotify", item)
          Mixer.savePlaybackTrack("spotify", json.data.uri)
          WsClientStore.broadcast(json)
          break
        case "active":
        case "inactive":
        case "not_playing":
        case "paused":
        case "repeat_context":
        case "repeat_track":
        case "shuffle_context":
        case "stopped":
        case "uri":
        case "volume":
        case "will_play":
          WsClientStore.broadcast(json)
          break
      }
    })
  }

  public static close() {
    if (LibrespotSocket.clientSocket) {
      LibrespotSocket.clientSocket.close()
      LibrespotSocket.clientSocket = undefined
    }
  }
}
