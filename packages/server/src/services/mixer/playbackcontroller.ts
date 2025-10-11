import { logger } from "@/core/logger"
import { PipeWire } from "@/core/pipewire"
import { FFplay } from "@/services/ffplay/"
import { IMediaPlayer } from "@/services/imediaplayer"
import { LocalMusic } from "@/services/localmusic"
import { RadioBrowser } from "@/services/radiobrowser/"
import { Spotify } from "@/services/spotify"
import { Streamer } from "@/services/streamer/"
import { TuneIn } from "@/services/tunein/"
import { DeviceMapper } from "./devicemapper"
import { PlaybackStateStore } from "./playbackstatestore"

export class PlaybackController {
  public static getMpdClient(): IMediaPlayer {
    return FFplay.Instance // Assuming FFplay implements IMediaPlayer and acts as the MPD client
  }

  public static getSpotifyClient(): Spotify {
    return new Spotify()
  }

  private static getActiveDeviceClient(source: string): IMediaPlayer | undefined {
    const deviceType = DeviceMapper.getOutputDeviceType(source)
    if (deviceType === "spotify") {
      return PlaybackController.getSpotifyClient()
    } else if (deviceType === "mpd") {
      return PlaybackController.getMpdClient()
    }
    return undefined
  }

  public static async play(source: string, id: string): Promise<any> {
    await DeviceMapper.ensureSource(source)

    // Save track details immediately after source is ensured
    PlaybackStateStore.savePlaybackTrack(source, id)

    switch (source) {
      case "spotify":
        return await PlaybackController.getSpotifyClient().play(id)
      case "tunein":
        return await new TuneIn().play(id)
      case "radiobrowser":
        return await new RadioBrowser().play(id)
      case "stream":
        return await new Streamer().play(id)
      case "library":
        return await new LocalMusic().play(id)
      default:
        return {}
    }
  }

  public static async pause(): Promise<any> {
    const source = PlaybackStateStore.activeOutputDevice()
    const client = PlaybackController.getActiveDeviceClient(source)
    return client ? await client.pause() : ""
  }

  public static async resume(): Promise<any> {
    const source = PlaybackStateStore.activeOutputDevice()
    const client = PlaybackController.getActiveDeviceClient(source)
    return client ? await client.resume() : ""
  }

  public static async next(): Promise<any> {
    const source = PlaybackStateStore.activeOutputDevice()
    const client = PlaybackController.getActiveDeviceClient(source)
    return client ? await client.next() : ""
  }

  public static async previous(): Promise<any> {
    const source = PlaybackStateStore.activeOutputDevice()
    const client = PlaybackController.getActiveDeviceClient(source)
    return client ? await client.previous() : ""
  }

  public static async seek(position: number): Promise<any> {
    // Seek logic seems specific to Spotify in the original, but should ideally check the active client
    const source = PlaybackStateStore.activeOutputDevice()
    const client = PlaybackController.getActiveDeviceClient(source)

    // Assuming all clients have seek, or checking for Spotify explicitly if needed
    if (client && "seek" in client) {
      return await client.seek(position)
    }
    return ""
  }

  public static async stop(): Promise<any> {
    const source = PlaybackStateStore.activeOutputDevice()
    const client = PlaybackController.getActiveDeviceClient(source)

    if (client) {
      PlaybackStateStore.removePlaybackState()
      return await client.stop()
    }
    return ""
  }

  public static async stopDevice(deviceType: string = ""): Promise<boolean> {
    const stopPromises: Promise<any>[] = []

    if (deviceType === "mpd" || deviceType === "") {
      logger.trace("Stopping MPD device")
      stopPromises.push(PlaybackController.getMpdClient().stop())
    }

    if (deviceType === "spotify" || deviceType === "") {
      logger.trace("Stopping Spotify device")
      stopPromises.push(PlaybackController.getSpotifyClient().stop())
    }

    await Promise.all(stopPromises)
    return true
  }

  public static async getStatus(): Promise<any> {
    const paClient = new PipeWire()
    const source = PlaybackStateStore.activeOutputDevice()
    const client = PlaybackController.getActiveDeviceClient(source)

    let res: any = { playing: false, source: "" }

    if (client) {
      res = await client.getStatus()
    }

    // Supplement status with volume/mute info from PipeWire
    const paState = await paClient.getVolumeStatus()

    if (res) {
      res.volume = paState.volume
      res.muted = paState.isMuted
    } else {
      res = { muted: paState.isMuted, volume: paState.volume }
    }

    return res
  }
}
