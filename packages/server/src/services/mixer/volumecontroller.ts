import { Equaliser } from "@/services/alsa/equaliser"
import { Pulseaudio } from "@/services/pulseaudio"
import { PlaybackStateStore } from "./playbackstatestore"

export class VolumeController {
  private static getPaClient(): Pulseaudio {
    return new Pulseaudio()
  }

  public static async setVolume(volume: number): Promise<any> {
    const paClient = VolumeController.getPaClient()
    // Update state first
    PlaybackStateStore.setPlaybackState({ volume: volume, muted: false })
    return await paClient.setVolume(volume)
  }

  public static async mute(): Promise<any> {
    const paClient = VolumeController.getPaClient()
    // Update state to muted (handled within setPlaybackState)
    PlaybackStateStore.setPlaybackState({ muted: true })
    return await paClient.mute()
  }

  public static async unmute(): Promise<any> {
    const paClient = VolumeController.getPaClient()
    // Update state to unmuted
    PlaybackStateStore.setPlaybackState({ muted: false })
    return await paClient.unmute()
  }

  public static async initialise(): Promise<void> {
    const state = PlaybackStateStore.getPlaybackState()

    // Apply saved volume
    await VolumeController.setVolume(state.volume)

    // Apply saved mute state
    if (state.muted) {
      await VolumeController.mute()
    }

    // Initialise Equaliser if a mixer is present in state
    if (state.mixer) {
      await Equaliser.initialise()
    }
  }
}
