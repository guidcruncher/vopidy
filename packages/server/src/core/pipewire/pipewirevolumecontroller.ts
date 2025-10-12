import { logger } from "@/core/logger"
import { exec, ExecException } from "child_process"
import { promisify } from "util"
import { VolumeStatus } from "./types"

const execPromise = promisify(exec)

export class PipeWireVolumeController {
  private readonly MAX_VOLUME_PERCENTAGE: number = 100

  private async executeCommand(command: string): Promise<string> {
    try {
      const { stdout, stderr } = await execPromise(command)
      if (stderr) {
        logger.warn(`pactl command produced stderr for: ${command}\nStderr: ${stderr.trim()}`)
      }
      return stdout.trim()
    } catch (error) {
      const err = error as ExecException
      logger.error(`Command failed: ${command}`, error)
      throw new Error(`Command failed: ${command}\nStderr: ${err.stderr || err.message}`)
    }
  }

  public async getVolumeStatus(): Promise<VolumeStatus> {
    const command = `pactl get-sink-volume @DEFAULT_SINK@`
    const rawOutput = await this.executeCommand(command)

    let volume = 0
    let isMuted = false

    const volumeMatch = rawOutput.match(/(\d+)%/)
    if (volumeMatch && volumeMatch[1]) {
      volume = parseInt(volumeMatch[1], 10)
    } else {
      logger.warn("Could not reliably parse volume percentage from pactl output.")
    }

    if (rawOutput.includes("Mute: yes")) {
      isMuted = true
    } else if (rawOutput.includes("Mute: no")) {
      isMuted = false
    }

    return {
      volume,
      isMuted,
    }
  }

  public async setVolume(percentage: number): Promise<void> {
    if (percentage < 0 || percentage > this.MAX_VOLUME_PERCENTAGE) {
      throw new Error(`Volume percentage must be between 0 and ${this.MAX_VOLUME_PERCENTAGE}.`)
    }
    const command = `pactl set-sink-volume @DEFAULT_SINK@ ${percentage}%`
    await this.executeCommand(command)
    logger.trace(`Volume set to ${percentage}%.`)
  }

  public async toggleMute(): Promise<void> {
    const command = `pactl set-sink-mute @DEFAULT_SINK@ toggle`
    await this.executeCommand(command)
    logger.trace("Mute state toggled.")
  }

  public async mute(): Promise<void> {
    const command = `pactl set-sink-mute @DEFAULT_SINK@ 1`
    await this.executeCommand(command)
    logger.trace("Sink is now Muted.")
  }

  public async unmute(): Promise<void> {
    const command = `pactl set-sink-mute @DEFAULT_SINK@ 0`
    await this.executeCommand(command)
    logger.trace("Sink is now Unmuted.")
  }
}
