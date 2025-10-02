import { logger } from "@/core/logger"
import { SnapServer } from "@/core/snapserver"
import { Mixer } from "@/services/mixer"
import { LibrespotSocket } from "@/services/spotify/librespotsocket"
import { default as child_process } from "node:child_process"
import { promisify } from "node:util"

const exec = promisify(child_process.exec)

export class ProcessManager {
  private static exitHandler(options, exitCode) {
    LibrespotSocket.close()
    SnapServer.close()
    Mixer.shutdown()
    if (options.cleanup) logger.trace("cleanup")
    if (exitCode || exitCode === 0) logger.trace(`Exit code ${exitCode}`)
    if (options.exit) process.exit()
  }

  public static start() {
    console.log("Starting initialisation")
    return Mixer.initialise().then(() => {
      return ProcessManager.processExists("go-librespot").then((librespotRunning) => {
        if (librespotRunning) {
          LibrespotSocket.open()
        }

        // do something when app is closing
        process.on("exit", ProcessManager.exitHandler.bind(null, { cleanup: true }))
        // catches ctrl+c event
        process.on("SIGINT", ProcessManager.exitHandler.bind(null, { exit: true }))
        // catches "kill pid" (for example: nodemon restart)
        process.on("SIGUSR1", ProcessManager.exitHandler.bind(null, { exit: true }))
        process.on("SIGUSR2", ProcessManager.exitHandler.bind(null, { exit: true }))
        // catches uncaught exceptions
        //process.on("uncaughtException", ProcessManager.exitHandler.bind(null, { exit: true }))
        console.log("Initialisation finished")
        return true
      })
    })
    console.log("Initialisation not finished.")
    return false
  }

  static async kill(name: string): Promise<boolean> {
    const pid = await ProcessManager.getPid(name)

    if (pid == 0) {
      return false
    }

    return new Promise<boolean>((resolve, reject) => {
      try {
        child_process.exec(`kill -9 ${pid}`, (error, stdout, stderr) => {
          if (error) {
            return resolve(false)
          }
          resolve(true)
        })
      } catch (err) {
        resolve(false)
      }
    })
  }

  static async processExists(name: string): Promise<boolean> {
    const pid = await ProcessManager.getPid(name)
    return pid != 0
  }

  static async getPid(name: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      try {
        child_process.exec(`pgrep -f ${name}`, (error, stdout, stderr) => {
          if (error) {
            return resolve(0)
          }
          resolve(parseInt(stdout))
        })
      } catch (err) {
        resolve(0)
      }
    })
  }
}
