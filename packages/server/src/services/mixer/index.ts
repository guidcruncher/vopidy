import { ProcessManager } from "@/core/processmanager"
import { IMediaPlayer } from "@/services/imediaplayer"
import { DeviceMapper } from "./devicemapper"
import { PlaybackController } from "./playbackcontroller"
import { PlaybackState } from "./playbackstate"
import { PlaybackStateStore } from "./playbackstatestore"
import { VolumeController } from "./volumecontroller"

export class Mixer {
  // --- Playback/Control Methods (Delegated to PlaybackController) ---

  public static async shutdown() {
    await ProcessManager.kill("go-librespot")
    await ProcessManager.kill("ffplay")
  }

  public static async ensurePlayback() {
    const state: PlaybackState = PlaybackStateStore.getPlaybackState()
    if (!state) {
      return {}
    }

    if (!state.source || !state.uri) {
      return {}
    }

    if (state.source !== "" && state.uri! + "") {
      const status = await Mixer.getStatus()
       if (status.track) {return {}
       }
      return await Mixer.play(state.source, state.uri)
    }

    return {}
  }

  public static getMediaPlayer(): IMediaPlayer {
    return PlaybackController.getMpdClient()
  }

  public static async play(source: string, id: string): Promise<any> {
    return PlaybackController.play(source, id)
  }

  public static async pause(): Promise<any> {
    return PlaybackController.pause()
  }

  public static async resume(): Promise<any> {
    return PlaybackController.resume()
  }

  public static async next(): Promise<any> {
    return PlaybackController.next()
  }

  public static async previous(): Promise<any> {
    return PlaybackController.previous()
  }

  public static async stop(): Promise<any> {
    return PlaybackController.stop()
  }

  public static async seek(position: number): Promise<any> {
    return PlaybackController.seek(position)
  }

  public static async getStatus(): Promise<any> {
    return PlaybackController.getStatus()
  }

  // This method is primarily used internally by DeviceMapper, but kept
  // for external consistency if needed.
  public static async stopDevice(deviceType: string = ""): Promise<boolean> {
    return PlaybackController.stopDevice(deviceType)
  }

  // --- Volume/State Initialization Methods (Delegated to VolumeController) ---

  public static async initialise(): Promise<void> {
    return VolumeController.initialise()
  }

  public static async setVolume(volume: number): Promise<any> {
    return VolumeController.setVolume(volume)
  }

  public static async mute(): Promise<any> {
    return VolumeController.mute()
  }

  public static async unmute(): Promise<any> {
    return VolumeController.unmute()
  }

  // --- State Management Methods (Delegated to PlaybackStateStore) ---

  public static getPlaybackState(): PlaybackState {
    return PlaybackStateStore.getPlaybackState()
  }

  public static setPlaybackState(obj: Partial<PlaybackState>): void {
    PlaybackStateStore.setPlaybackState(obj)
  }

  public static savePlaybackTrack(source: string, uri: string): void {
    PlaybackStateStore.savePlaybackTrack(source, uri)
  }

  public static removePlaybackState(): void {
    PlaybackStateStore.removePlaybackState()
  }

  public static activeOutputDevice(): string {
    return PlaybackStateStore.activeOutputDevice()
  }

  // --- Source/Device Mapping Method (Delegated to DeviceMapper) ---

  // Note: The original Mixer.ensureSource contained logic that involved both
  // DeviceMapper and PlaybackStateStore, but is best kept in DeviceMapper
  // for flow control. We expose it directly.
  public static async ensureSource(source: string): Promise<boolean> {
    return DeviceMapper.ensureSource(source)
  }
}
