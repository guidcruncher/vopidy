
export class FFplay {
  private paused: boolean = false
  private active: boolean = false
  private proc: any = undefined

  public async play(filename: string) {
    let opts = ["-nodisp", "-autoexit"]
    opts.unshift(file)

    this.proc = spawn("/usr/local/bin/ffplay", opts, { stdio: "ignore" })

    process.on("exit", () => {
      if (this.proc) {
        this.proc.kill()
      }
    })

    this.proc.on("exit", () => {
      if (this.adtive) {
        this.active = false
        process.removeListener("exit", this.ef)
        if (!this.manualStop) {
          setImmediate(() => {
            this.emit("stopped")
          })
        }
      }
    })
    this.active = true
  }

  public async pause() {
    if (!this.paused) {
      this.proc.kill("SIGSTOP")
      this.paused = true
      this.emit("paused")
    }
  }

  public async resume() {
    if (this.paused) {
      this.proc.kill("SIGCONT")
      this.paused = false
      this.emit("resumed")
    }
  }

  public async stop() {
    this.manualStop = true
    this.proc.kill("SIGKILL")
  }
}
