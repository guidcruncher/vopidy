// audio-downloader.ts

/**
 * Handles downloading raw audio data from a URL.
 */
export class AudioDownloader {
  /**
   * Downloads a part of the audio from a given URL.
   * @param url The URL to download from.
   * @returns A Promise that resolves with the audio data as a Uint8Array.
   */
  public async downloadPart(url: string): Promise<Uint8Array> {
    try {
      const res = await fetch(url)

      if (res.ok) {
        // fetch returns Uint8Array for .bytes()
        return await res.arrayBuffer().then((buffer) => new Uint8Array(buffer))
      }

      // Return an empty array if response is not ok (e.g., 404, 500)
      return new Uint8Array()
    } catch (err) {
      // Return an empty array on network or other fetch errors
      return new Uint8Array()
    }
  }
}
