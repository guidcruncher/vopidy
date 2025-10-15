import { logger } from "@/core/logger"
import { exec } from "child_process"
import { promisify } from "util"
import { TtsSynthesizer } from "./ttssynthesizer"

const execPromise = promisify(exec)
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
    const opts = ["-nodisp", "-autoexit", `"${url}"`]
    logger.debug("/usr/bin/ffplay " + opts.join(" "))

    try {
      await execPromise("/usr/bin/ffplay " + opts.join(" "))
    } catch (err) {
      logger.error("Error in FFplayProcessManager.play", err)
    }

    return url
  }
}
