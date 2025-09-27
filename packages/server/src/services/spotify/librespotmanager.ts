import { Body, Http, HttpAuth } from "@/core/http/"
import { logger } from "@/core/logger"
import { pm2 } from "@/core/pm2"
import { Auth } from "@/services/auth"
import { Mixer } from "@/services/mixer"
import * as fs from "fs"
import { default as child_process } from "node:child_process"
import { promisify } from "node:util"
import * as path from "path"
import { SpotifyAuth } from "./spotifyauth"

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

  public async connect(name: string, accessToken: string, forceReconnect: boolean = false) {
    let state = this.getLibrespotState()
    let pstate = Mixer.getPlaybackState()
    logger.warn("Connecting to go-librespot")
    if (process.env.GOLIBRESPOT_CREDENTIAL_TYPE.toString() == "spotify_token") {
      logger.debug("Connecting via spotify token credentials")
      await this.connectToLibRespotWithToken()
      return "CONNECTED"
    }

    if (state.device_id == "") {
      logger.error("Vopidy Librespot instance not found")
      return "NOTFOUND"
    }

    let res: any = {}
    const url = `https://api.spotify.com/v1/me/player`
    logger.debug("Connecting to " + state.device_id)

    res = await HttpAuth.put(
      url,
      Body.json({ device_ids: [state.device_id] }),
      this.getAuthHeaders(),
    )

    if (!res.ok) {
      logger.error(`Error connecting to Librespot ${res.status} ${res.statipusText}`)
      return "ERROR"
    }

    Mixer.setPlaybackState({ librespot: state.device_id })

    return "OK"
  }

  async restart() {
    return await pm2.restartGoLibRespot()
  }

  private async getAuthHeaders() {
    return await SpotifyAuth.getAuthorization()
  }
}
