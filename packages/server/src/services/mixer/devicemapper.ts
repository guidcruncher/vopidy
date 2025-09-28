import { WsClientStore } from "@/core/wsclientstore"
import { PlaybackController } from "./playbackcontroller" // Dependency for stopdevice
import { PlaybackStateStore } from "./playbackstatestore"

// Constant for device mapping
const devicemap: { [key: string]: string } = {
  spotify: "spotify",
  tunein: "mpd",
  radiobrowser: "mpd",
  stream: "mpd",
  library: "mpd",
}

export class DeviceMapper {
  public static getOutputDeviceType(source: string): string | undefined {
    return devicemap[source]
  }

  /**
   * Ensures the active source is the one requested. If it changes,
   * it stops the old device if the device type changes.
   */
  public static async ensureSource(newSource: string): Promise<boolean> {
    const state = PlaybackStateStore.getPlaybackState()
    const currentSource = state.source

    if (currentSource === newSource) {
      return false // Source hasn't changed
    }

    if (currentSource !== "") {
      const oldDeviceType = DeviceMapper.getOutputDeviceType(currentSource)
      const newDeviceType = DeviceMapper.getOutputDeviceType(newSource)

      if (oldDeviceType && newDeviceType && oldDeviceType !== newDeviceType) {
        // Stop the old output device if it's different
        await PlaybackController.stopDevice(oldDeviceType)
      }
    }

    // Update the state with the new source
    PlaybackStateStore.setPlaybackState({ source: newSource })

    // Broadcast the change
    WsClientStore.broadcast({
      type: "source-changed",
      data: { current: currentSource, new: newSource },
    })

    return true
  }
}
