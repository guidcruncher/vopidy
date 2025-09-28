import { logger } from "@/core/logger"
import { Mixer } from "@/services/mixer"
import { Pulseaudio } from "@/services/pulseaudio"
import * as crypto from "crypto"
import * as fs from "fs"
import { Buffer } from "node:buffer"
import child_process from "node:child_process"
import { promisify } from "node:util"
import * as os from "os"
import * as path from "path"

const execFile = promisify(child_process.execFile)

/**
 * Handles playing audio buffers using system services (Pulseaudio/paplay).
 */
export class AudioPlayer {
  private readonly PULSE_CLIENT: Pulseaudio

  constructor() {
    this.PULSE_CLIENT = new Pulseaudio()
  }

  /**
   * Calculates the appropriate volume for TTS playback, boosting it if other media is playing.
   */
  private async calculateTtsVolume(): Promise<number> {
    let volume = await this.PULSE_CLIENT.getVolumeLinear()
    const state = await Mixer.getStatus()

    // Boost volume if media is currently playing to ensure TTS is heard
    if (state && state.playing) {
      volume += 15000 // Arbitrary boost value
      if (volume > 65535) {
        volume = 65535 // Max volume
      }
    }
    return volume
  }

  /**
   * Writes the audio buffer to a temporary file and plays it using paplay.
   * @param buffer The audio data as a Buffer.
   * @returns A Promise that resolves when playback is complete.
   */
  public async play(buffer: Buffer): Promise<void> {
    const volume = await this.calculateTtsVolume()
    const filename = path.join(os.tmpdir(), `${crypto.randomBytes(16).toString("hex")}.mp3`)

    try {
      // Write the buffer to a temporary file
      fs.writeFileSync(filename, buffer, { encoding: "base64" })

      // Execute paplay to play the file
      await execFile("/usr/bin/paplay", [`--volume=${volume}`, `${filename}`])
    } catch (err) {
      logger.error("Error playing TTS", err)
      throw new Error("Failed to play audio.")
    } finally {
      // Ensure the temporary file is deleted
      if (fs.existsSync(filename)) {
        fs.unlinkSync(filename)
      }
    }
  }
}
