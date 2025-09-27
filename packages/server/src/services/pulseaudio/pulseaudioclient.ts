import { PulseAudio } from "pulseaudio.js"

// Handles the connection and disconnection logic for the PulseAudio library.
export class PulseAudioClient {
  private socketPath = "/tmp/pulse/native" as any

  /**
   * Initializes and connects to the PulseAudio server.
   * @returns The connected PulseAudio instance.
   */
  public async connect(): Promise<PulseAudio> {
    // Note: The original code passed 'undefined' for host and port.
    const pa = new PulseAudio(undefined, undefined, this.socketPath)
    await pa.connect()
    return pa
  }

  /**
   * Disconnects from the PulseAudio server.
   * @param pa The connected PulseAudio instance.
   */
  public async disconnect(pa: PulseAudio): Promise<void> {
    await pa.disconnect()
  }
}
