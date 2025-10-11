import { Authorization, Body, Http } from "@/core/http/"
import { logger } from "@/core/logger"
import { ProcessManager } from "@/core/processmanager"
import { Auth } from "@/services/auth"
import { Mixer } from "@/services/mixer/"
import * as fs from "fs"
import { default as child_process } from "node:child_process"
import { promisify } from "node:util"
import * as path from "path"
import { LibrespotSocket } from "./librespotsocket"
import { SpotifyAuth } from "./spotifyauth"

const exec = promisify(child_process.exec)

export class LibrespotManager {
  getState() {
    const filename = path.join(process.env.GOLIBRESPOT_STATE, "state.json")

    if (fs.existsSync(filename)) {
      return JSON.parse(fs.readFileSync(filename, "utf8"))
    }
    return { device_id: "", event_manager: null, credentials: { username: "", data: "" } }
  }

  setState(state: any) {
    const filename = path.join(process.env.GOLIBRESPOT_STATE, "state.json")
    if (fs.existsSync(filename)) {
      fs.copyFileSync(filename, filename + ".bak")
    }
    fs.writeFileSync(filename, JSON.stringify(state), "utf8")
  }

  async getLibrespotPid() {
    return ProcessManager.getPid("go-librespot")
  }

  async connectWithToken() {
    return new Promise(async (resolve, reject) => {
      const authClient = new Auth()
      const auth = authClient.loadAuthState()
      let pid = await this.getLibrespotPid()
      logger.debug("Existing go-librespot pid", pid)
      if (pid == 0) {
        logger.warn("Spawning librespot")
        await exec(
          `/usr/local/bin/librespot.sh "${auth.profile.display_name}", "${auth.auth.access_token}"`,
        ).then(() => {
          LibrespotSocket.open()
          resolve(auth.profile)
        })
      } else {
        resolve(auth.profile)
      }
    })
  }

  public async connect(name: string, accessToken: string, forceReconnect: boolean = false) {
    let state = this.getState()
    let pstate = Mixer.getPlaybackState()
    logger.warn("Connecting to go-librespot")
    if (process.env.GOLIBRESPOT_AUTHMODE.toString() == "spotify_token") {
      logger.debug("Connecting via spotify token credentials")
      await this.connectWithToken()
      return "CONNECTED"
    }

    if (state.device_id == "") {
      logger.error("Vopidy Librespot instance not found")
      return "NOTFOUND"
    }

    let res: any = {}
    const url = `https://api.spotify.com/v1/me/player`
    logger.debug("Connecting to " + state.device_id)

    res = await Http.NoCache()
      .Authorize(this.getAuthHeaders)
      .put(url, Body.json({ device_ids: [state.device_id] }))

    if (!res.ok) {
      logger.error(`Error connecting to Librespot ${res.status} ${res.statusText}`)
      return "ERROR"
    }

    LibrespotSocket.open()
    Mixer.setPlaybackState({ librespot: state.device_id })
    return "OK"
  }

  private async getAuthHeaders(): Promise<Authorization> {
    return await SpotifyAuth.getAuthorization()
  }
}
