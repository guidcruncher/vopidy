import { db } from "@/services/db/"
import { LocalMusic } from "@/services/localmusic"
import { Mixer } from "@/services/mixer/"
import { PipeWire } from "@/core/pipewire"
import { RadioBrowser } from "@/services/radiobrowser/"
import { TuneIn } from "@/services/tunein/"
import { FFplayMetadata } from "./ffplaymetadata"
import { FFplayProcessManager } from "./ffplayprocessmanager"

export interface MediaPlayerStatus {
  source: string
  track: any
  playing: boolean
  paused: boolean
  volume: number
}

export class MediaPlayerStatusAggregator {
  private paClient: PipeWire
  private tuneinClient: TuneIn
  private radioBrowserClient: RadioBrowser
  private localClient: LocalMusic

  constructor() {
    // Instantiate dependencies once if they are stateless/singletons
    this.paClient = new PipeWire()
    this.tuneinClient = new TuneIn()
    this.radioBrowserClient = new RadioBrowser()
    this.localClient = new LocalMusic()
  }

  public async getStatus(
    processManager: FFplayProcessManager,
    metadataFetcher: FFplayMetadata,
  ): Promise<MediaPlayerStatus> {
    const playback = Mixer.getPlaybackState()
    const playbackSource = playback.source
    const playbackUri = playback.uri

    let state: any = { source: "mpd", track: {} }

    // 1. Fetch Track/Source Metadata
    switch (playbackSource) {
      case "tunein":
        state.track = await this.tuneinClient.describe(playbackUri)
        state.source = "tunein"
        break
      case "stream":
        state.track = await db.getPlaylistItem(playbackUri)
        state.source = "stream"
        break
      case "radiobrowser":
        state.track = await this.radioBrowserClient.describe(playbackUri)
        state.source = "radiobrowser"
        break
      case "library":
        state.track = await this.localClient.describe(playbackUri)
        state.source = "library"
        break
    }

    // 2. Fetch Live Stream/NowPlaying Data
    const nowPlaying = await metadataFetcher.getNowPlaying(
      processManager.getCurrentUrl(),
      processManager.isPlayerActive(),
    )
    state.track.nowplaying = nowPlaying

    // 3. Fetch System/Playback State
    const vol = await this.paClient.getVolume()

    return {
      source: state.source,
      track: state.track,
      playing: processManager.isPlayerActive(),
      paused: processManager.isPlayerPaused(),
      volume: vol,
    }
  }
}
