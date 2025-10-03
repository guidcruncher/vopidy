import { logger } from "@/core/logger"
import { ProcessManager } from "@/core/processmanager"
import { WsClientStore } from "@/core/wsclientstore"
import { Mixer } from "@/services/mixer/"
import { spawn } from "child_process"

export class FFplayProcessManager {
  private proc: any = undefined
  private url: string = ""
  private isActive: boolean = false
  private isPaused: boolean = false
  private isStopped: boolean = false // Only used in original FFplay.shutdown()

  public isPlayerActive(): boolean {
    return this.isActive
  }

  public isPlayerPaused(): boolean {
    return this.isPaused
  }

  public getCurrentUrl(): string {
    return this.url
  }

  private writePidFile(pid: number) {
    ProcessManager.writePidFile("ffplay", pid)
  }

  private deletePidFile() {
    ProcessManager.deletePidFile("ffplay")
  }

  private onProcessExit = () => {
    if (this.isActive) {
      this.isActive = false
      // Remove process listener upon exit to clean up
      process.removeListener("exit", this.onSystemExit)
      this.deletePidFile()
    }
  }

  private onSystemExit = () => {
    if (this.proc) {
      this.proc.kill("SIGKILL")
    }
    this.deletePidFile()
    // Assuming Mixer.removePlaybackState is an application-level cleanup, keep it here.
    Mixer.removePlaybackState()
  }

  public async play(filename: string): Promise<void> {
    if (this.isActive) {
      await this.stop()
    }
    const opts = ["-nodisp", "-autoexit", filename]
    logger.debug("/usr/bin/ffplay " + opts.join(" "))

    try {
      this.proc = spawn("/usr/bin/ffplay", opts, { stdio: "ignore" })
      this.writePidFile(this.proc.pid)

      process.on("exit", this.onSystemExit)
      this.proc.on("exit", this.onProcessExit)

      this.url = filename
      this.isActive = true
      this.isPaused = false
      WsClientStore.broadcast({ type: "playing", data: { source: "mpd" } })
    } catch (err) {
      logger.error("Error in FFplayProcessManager.play", err)
      this.isActive = false // Ensure state is clean on failure
      this.deletePidFile()
    }
  }

  public async pause(): Promise<void> {
    if (this.isActive && !this.isPaused) {
      this.proc.kill("SIGSTOP")
      this.isPaused = true
      WsClientStore.broadcast({ type: "paused", data: { source: "mpd" } })
    }
  }

  public async resume(): Promise<void> {
    if (this.isActive && this.isPaused) {
      this.proc.kill("SIGCONT")
      this.isPaused = false
      WsClientStore.broadcast({ type: "playing", data: { source: "mpd" } })
    }
  }

  public async stop(): Promise<void> {
    this.url = ""
    this.isStopped = true // Use internal flag

    if (this.proc) {
      this.proc.kill("SIGKILL")
    }

    ProcessManager.kill("ffplay")

    // Cleanup handled by this.onProcessExit, but we can proactively clean up state
    this.isActive = false
    this.isPaused = false
    this.proc = undefined

    this.deletePidFile()
    WsClientStore.broadcast({ type: "stopped", data: { source: "mpd" } })
  }

  public shutdown() {
    // This is the static method equivalent, for controlled application shutdown
    if (!this.isActive) {
      return
    }
    this.deletePidFile()
    this.isStopped = true
    this.url = ""
    this.proc.kill("SIGKILL")
    this.isActive = false
    this.proc = undefined
  }
}
