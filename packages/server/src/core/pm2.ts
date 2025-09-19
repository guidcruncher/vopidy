import { logger } from "@/core/logger"
import { exec } from "node:child_process"

export class pm2 {
  public static async exec(base: boolean, command: string, services: string[]) {
    switch (command) {
      case "start":
        return await pm2.start(base, services)
      case "stop":
        return await pm2.stop(base, services)
      case "restart":
        await pm2.stop(base, services)
        return await pm2.start(base, services)
    }

    return undefined
  }

  private static getInstance(base: boolean) {
    return base ? "/usr/local/bin/pm2base.sh" : "/usr/local/bin/pm2.sh"
  }

  public static async stop(base: boolean, services: string[]) {
    const cmd = `${pm2.getInstance(base)} stop ${services.join(" ")}`
    logger.trace("pm2 spawn " + cmd)

    return new Promise<string>((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          logger.error("Error running pm2", error)
          reject(error)
          return
        }

        if (stderr && stderr != "") {
          logger.error("Error running pm2", stderr)
        }

        resolve(stdout)
      })
    })
  }

  public static async restartGoLibRespot() {
    return new Promise<string>((resolve, reject) => {
      exec("kill $(pgrep -f go-librespot)", (error, stdout, stderr) => {
        exec("/usr/local/bin/pm2base.sh restart go-librespot", (error, stdout, stderr) => {
          if (error) {
            logger.error("Error running pm2", error)
            reject(error)
            return
          }
          if (stderr && stderr != "") {
            logger.error("Error running pm2", stderr)
          }
          resolve(stdout)
        })
      })
    })
  }

  public static async killCast() {
    return new Promise<string>((resolve, reject) => {
      exec("/usr/local/bin/snapserver.sh shutdown", (error, stdout, stderr) => {
        if (error) {
          logger.error("Error running pm2", error)
          reject(error)
          return
        }
        if (stderr && stderr != "") {
          logger.error("Error running pm2", stderr)
        }
        resolve(stdout)
      })
    })
  }

  public static async start(base: boolean, services: string[]) {
    const cmd = `${pm2.getInstance(base)} start "${services.join(" ")}"`
    logger.trace("pm2 spawn " + cmd)

    return new Promise<string>((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          logger.error("Error running pm2", error)
          reject(error)
          return
        }

        if (stderr && stderr != "") {
          logger.error("Error running pm2", stderr)
        }

        resolve(stdout)
      })
    })
  }
}
