import { AudioPlayer } from "./audioplayer"
import { TtsSynthesizer } from "./ttssynthesizer"
// Note: AudioDownloader is not used in the speak method,
// but you would include it here if you added a download() method to the Facade.

/**
 * Facade for the Text-to-Speech system.
 * It provides a simple, unified interface for synthesizing and playing audio.
 */
export class Tts {
  private readonly synthesizer: TtsSynthesizer
  private readonly player: AudioPlayer

  constructor() {
    this.synthesizer = new TtsSynthesizer()
    this.player = new AudioPlayer()
  }

  /**
   * Synthesizes the given text into audio and immediately plays it.
   * This method hides the complexity of text chunking, synthesis, and playback logic.
   * * @param lang The language code (e.g., 'en', 'es').
   * @param text The text to be spoken.
   * @returns A Promise that resolves when the audio playback is complete.
   */
  public async speak(lang: string, text: string): Promise<void> {
    try {
      // 1. Synthesis: The Facade delegates the synthesis task.
      const audioBuffer = await this.synthesizer.synthesize(lang, text)

      // 2. Playback: The Facade delegates the playback task.
      await this.player.play(audioBuffer)

      // Optionally, you could return a status if needed
    } catch (error) {
      // The Facade provides a single point for error handling.
      // Re-throw the error to be handled by the caller.
      throw new Error(
        `TTS failed to speak text: "${text.substring(0, 30)}..." - Original Error: ${error.message}`,
      )
    }
  }

  // You could add other facade methods here, for example:
  /*
  public async download(lang: string, text: string, filePath: string): Promise<void> {
      const audioBuffer = await this.synthesizer.synthesize(lang, text);
      fs.writeFileSync(filePath, audioBuffer);
  }
  */
}
