import { exec } from "node:child_process"
import { logger } from "@/core/logger"

export class pm2 {
  public static async exec(command: string, services: string[]) {
    switch (command) {
      case "start":
        return await pm2.start(services)
      case "stop":
        return await pm2.stop(services)
      case "restart":
        await pm2.stop(services)
        return await pm2.start(services)
    }

    return undefined
  }

  public static async stop(services: string[]) {
    const cmd = `/usr/local/bin/pm2 stop ${services.join(" ")}`
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

  public static async start(services: string[]) {
    const cmd = `/usr/local/bin/pm2 start /app/ecosystem.config.cjs --only "${services.join(",")}"`
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
