// media-player.service.ts

import { Mixer } from "@/services/mixer"

/**
 * Handles interactions with the underlying media player system (MPD client via Mixer).
 */
export class MediaPlayerService {
  /**
   * Starts playback of a specific URL.
   * @param url The URL of the stream/track to play.
   * @returns A promise that resolves upon successful command execution.
   */
  public async playUrl(url: string): Promise<any> {
    const mpdClient = Mixer.getMediaPlayer()
    return mpdClient.play(url)
  }

  /**
   * Records the currently playing track in the mixer/playback state.
   * @param source The source type (e.g., "stream").
   * @param id The ID of the track.
   */
  public savePlaybackTrack(source: string, id: string): void {
    Mixer.savePlaybackTrack(source, id)
  }
}
