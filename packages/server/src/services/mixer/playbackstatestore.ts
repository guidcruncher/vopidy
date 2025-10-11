import * as fs from "node:fs"
import { PlaybackState } from "./playbackstate"

export class PlaybackStateStore {
  private static readonly FILENAME = process.env.VOPIDY_DB.toString() + "/playbackstate.json"

  public static getPlaybackState(): PlaybackState {
    if (fs.existsSync(PlaybackStateStore.FILENAME)) {
      try {
        const raw = fs.readFileSync(PlaybackStateStore.FILENAME, "utf8")
        return JSON.parse(raw) as PlaybackState
      } catch (error) {
        // Handle potential JSON parse errors or other read issues
        console.error("Error reading playback state, returning default.", error)
      }
    }
    return new PlaybackState()
  }

  public static savePlaybackState(state: PlaybackState): void {
    // Optionally remove/overwrite the old file
    if (fs.existsSync(PlaybackStateStore.FILENAME)) {
      fs.unlinkSync(PlaybackStateStore.FILENAME)
    }
    fs.writeFileSync(PlaybackStateStore.FILENAME, JSON.stringify(state), "utf8")
  }

  public static setPlaybackState(obj: Partial<PlaybackState>): void {
    const state = PlaybackStateStore.getPlaybackState()

    // Logic to handle volume/lastvolume on state changes
    if (obj.muted && !state.muted) {
      state.lastvolume = state.volume
    } else if (obj.volume !== undefined && obj.volume !== state.volume) {
      state.lastvolume = state.volume
    }

    // Apply updates from the provided object
    Object.assign(state, obj)

    PlaybackStateStore.savePlaybackState(state)
  }

  public static savePlaybackTrack(source: string, uri: string): void {
    PlaybackStateStore.setPlaybackState({ uri: uri, source: source })
  }

  public static removePlaybackState(): void {
    PlaybackStateStore.setPlaybackState({ uri: "", source: "" })
  }

  public static activeOutputDevice(): string {
    const state = PlaybackStateStore.getPlaybackState()
    return state?.source || ""
  }
}
