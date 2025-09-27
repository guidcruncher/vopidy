// FFplay.ts (The new entry point)
import { IMediaPlayer } from "@/services/imediaplayer"
import { FFplayMetadata } from "./ffplaymetadata"
import { FFplayProcessManager } from "./ffplayprocessmanager"
import { MediaPlayerStatus, MediaPlayerStatusAggregator } from "./mediaplayerstatusaggregator"

export class FFplay implements IMediaPlayer {
  private static _instance: FFplay

  // New dependencies
  private processManager: FFplayProcessManager
  private metadataFetcher: FFplayMetadata
  private statusAggregator: MediaPlayerStatusAggregator

  private constructor() {
    this.processManager = new FFplayProcessManager()
    this.metadataFetcher = new FFplayMetadata()
    this.statusAggregator = new MediaPlayerStatusAggregator()
  }

  public static get Instance(): FFplay {
    return this._instance || (this._instance = new this())
  }

  // --- IMediaPlayer Implementation (Proxy methods) ---

  public async play(filename: string): Promise<MediaPlayerStatus> {
    await this.processManager.play(filename)
    // getStatus now relies on the processManager state
    return this.getStatus()
  }

  public async pause(): Promise<MediaPlayerStatus> {
    await this.processManager.pause()
    return this.getStatus()
  }

  public async resume(): Promise<MediaPlayerStatus> {
    await this.processManager.resume()
    return this.getStatus()
  }

  public async stop(): Promise<MediaPlayerStatus> {
    await this.processManager.stop()
    return this.getStatus()
  }

  public async getNowPlaying(): Promise<any> {
    // Direct call to the new metadata class
    return this.metadataFetcher.getNowPlaying(
      this.processManager.getCurrentUrl(),
      this.processManager.isPlayerActive(),
    )
  }

  public async getStatus(): Promise<MediaPlayerStatus> {
    // Direct call to the new status class
    return this.statusAggregator.getStatus(this.processManager, this.metadataFetcher)
  }

  // --- Static methods (now instance methods on a static facade) ---

  public static shutdown(): void {
    // Proxy the static call to the process manager instance
    FFplay.Instance.processManager.shutdown()
  }

  // Other IMediaPlayer methods
  public async next() {
    return this.getStatus()
  }
  public async previous() {
    return this.getStatus()
  }
  public async seek(position: number) {
    return {}
  }
}
