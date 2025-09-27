import { logger } from "@/core/logger"
import { SnapServer } from "@/core/snapserver"
import { WsClientStore } from "@/core/wsclientstore"
import { db } from "@/services/db"
import { FFplay } from "@/services/ffplay/"
import { Mixer } from "@/services/mixer"
import { SpotifyCatalog } from "@/services/spotify/spotifycatalog"
import { exec } from "node:child_process"

export class ProcessLauncher {
  private static clientSocket: any = undefined

  private static getPidFolder() {
    if (process.env.IN_DOCKER) {
      return "/app/pids"
    }

    return process.env.VOPIDY_CONFIG.toString()
  }

  private static exitHandler(options, exitCode) {
    if (ProcessLauncher.clientSocket) {
      ProcessLauncher.clientSocket.close()
      ProcessLauncher.clientSocket = undefined
    }

    SnapServer.close()

    FFplay.shutdown()

    if (options.cleanup) logger.trace("cleanup")
    if (exitCode || exitCode === 0) logger.trace(`Exit code ${exitCode}`)
    if (options.exit) process.exit()
  }

  public static startLibrespot() {
    ProcessLauncher.clientSocket = new WebSocket("ws://localhost:3678/events")

    ProcessLauncher.clientSocket.addEventListener("message", async (event) => {
      const json = JSON.parse(event.data)
      if (!json.data) {
        json.data = {}
      }

      logger.trace(`Incoming Librespot message "${json.type}"`)
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

  public static start() {
    console.log("Starting initialisation")

    return Mixer.initialise().then(() => {
      ProcessLauncher.startLibrespot()

      // do something when app is closing
      process.on("exit", ProcessLauncher.exitHandler.bind(null, { cleanup: true }))
      // catches ctrl+c event
      process.on("SIGINT", ProcessLauncher.exitHandler.bind(null, { exit: true }))
      // catches "kill pid" (for example: nodemon restart)
      process.on("SIGUSR1", ProcessLauncher.exitHandler.bind(null, { exit: true }))
      process.on("SIGUSR2", ProcessLauncher.exitHandler.bind(null, { exit: true }))
      // catches uncaught exceptions
      //process.on("uncaughtException", ProcessLauncher.exitHandler.bind(null, { exit: true }))
      console.log("Initialisation finished")
      return true
    })
    console.log("Initialisation not finished.")
    return false
  }

  public static killMpd() {
    const cmd = "/usr/bin/mpd --kill /srv/config/mpd.conf"
    logger.trace(`Executing ${cmd}`)
    exec(cmd)
  }

  public static restartPm2Process(name: string) {
    if (name == "Mpd") {
      ProcessLauncher.killMpd()
    }

    const cmd = "/usr/local/bin/pm2 restart " + name
    logger.trace(`Executing ${cmd}`)
    exec(cmd)
  }
}
