import { logger } from "@/core/logger"
import { pm2 } from "@/core/pm2"
import { Auth } from "@/services/auth"
import * as fs from "fs"
import { default as child_process } from "node:child_process"
import { promisify } from "node:util"
import * as path from "path"

const exec = promisify(child_process.exec)

export class LibrespotManager {
  getState() {
    const filename = path.join(process.env.LIBRESPOT_CONFIG, "state.json")
    if (fs.existsSync(filename)) {
      return JSON.parse(fs.readFileSync(filename, "utf8"))
    }
    return { device_id: "", event_manager: null, credentials: { username: "", data: "" } }
  }

  setState(state: any) {
    const filename = path.join(process.env.LIBRESPOT_CONFIG, "state.json")
    if (fs.existsSync(filename)) {
      fs.copyFileSync(filename, filename + ".bak")
    }
    fs.writeFileSync(filename, JSON.stringify(state), "utf8")
  }

  async connectWithToken() {
    const authClient = new Auth()
    const auth = authClient.loadAuthState()
    logger.trace(`Connecting to Librespot with token ${auth.auth.access_token}`)
    return await exec("/usr/local/bin/pm2base.sh restart go-librespot", {
      env: { SPOTIFY_USERNAME: auth.profile.display_name, SPOTIFY_TOKEN: auth.auth.access_token },
    })
  }

  async restart() {
    return await pm2.restartGoLibRespot()
  }
}
