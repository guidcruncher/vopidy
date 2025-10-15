import { FFplay } from "@/services/ffplay/"
import { TtsSynthesizer } from "./ttssynthesizer"

/**
 * Facade for the Text-to-Speech system.
 * It provides a simple, unified interface for synthesizing and playing audio.
 */
export class Tts {
  private readonly synthesizer: TtsSynthesizer

  constructor() {
    this.synthesizer = new TtsSynthesizer()
  }

  public async speak(lang: string, text: string): Promise<string> {
    const url = await this.synthesizer.synthesize(lang, text)
    console.log(url)
    await FFplay.Instance.playDetached(url)
    return url
  }
}
