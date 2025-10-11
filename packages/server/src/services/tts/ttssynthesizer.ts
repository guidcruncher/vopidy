import { logger } from "@/core/logger"
import * as googleTTS from "google-tts-api"
import { Buffer } from "node:buffer"

/**
 * Handles the generation of TTS audio data from text.
 */
export class TtsSynthesizer {
  /**
   * Generates TTS audio data (Buffer) for a given text.
   * Automatically handles short and long text by using the appropriate googleTTS method.
   * @param lang The language code (e.g., 'en', 'es').
   * @param text The text to synthesize.
   * @returns A Promise that resolves with the concatenated audio Buffer.
   */
  public async synthesize(lang: string, text: string): Promise<Buffer> {
    if (text.length < 200) {
      return this.synthesizeShort(lang, text)
    } else {
      return this.synthesizeLong(lang, text)
    }
  }

  /**
   * Generates TTS for short text using getAudioBase64.
   */
  private async synthesizeShort(lang: string, text: string): Promise<Buffer> {
    try {
      const base64Audio = await googleTTS.getAudioBase64(text, {
        lang: lang,
        slow: false,
        host: "https://translate.google.com",
        timeout: 10000,
      })
      return Buffer.from(base64Audio, "base64")
    } catch (err) {
      logger.error("Error in getAudioBase64", err)
      throw new Error("Failed to synthesize short text.")
    }
  }

  /**
   * Generates TTS for long text using getAllAudioBase64 and concatenates the parts.
   */
  private async synthesizeLong(lang: string, text: string): Promise<Buffer> {
    try {
      const audioParts = await googleTTS.getAllAudioBase64(text, {
        lang: lang,
        slow: false,
        host: "https://translate.google.com",
        timeout: 10000,
      })

      if (!audioParts || audioParts.length === 0) {
        throw new Error("Received no audio parts for long text.")
      }

      const buffers = audioParts.map((item) => Buffer.from(item.base64, "base64"))
      return Buffer.concat(buffers)
    } catch (err) {
      logger.error("Error in getAllAudioBase64", err)
      throw new Error("Failed to synthesize long text.")
    }
  }
}
