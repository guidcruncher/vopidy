import { logger } from "@/core/logger"
import { LibrespotManager } from "@/services/spotify/librespotmanager"
import { SpotifyAuth } from "@/services/spotify/spotifyauth"

import { HTTPException } from "hono/http-exception"
import * as fs from "node:fs"
import * as path from "node:path"
import { AuthorizationCode } from "simple-oauth2"

export const spotifyScopes: string[] = [
  "streaming",
  "user-read-private",
  "user-read-email",
  "user-read-playback-state",
  "user-modify-playback-state",
  "playlist-read-private",
  "playlist-read-private",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-follow-modify",
  "user-read-recently-played",
  "user-follow-read",
  "user-library-read",
  "user-library-modify",
  "user-top-read",
]

export class Auth {
  public get spotifyAuthClient() {
    return new AuthorizationCode({
      client: {
        id: process.env.SPOTIFY_CLIENT_ID.toString(),
        secret: process.env.SPOTIFY_CLIENT_SECRET.toString(),
      },
      auth: {
        tokenHost: "https://accounts.spotify.com",
        tokenPath: "/api/token",
        refreshPath: "/api/token",
        authorizePath: "/authorize",
      },
    })
  }

  public saveAuthState(state, profile = {}) {
    const filename = path.join(process.env.VOPIDY_DB.toString(), ".vopidy-auth.json")
    fs.writeFileSync(filename, JSON.stringify({ auth: state, profile: profile }))
    return state
  }

  public loadAuthState() {
    const filename = path.join(process.env.VOPIDY_DB.toString(), ".vopidy-auth.json")
    if (fs.existsSync(filename)) {
      const state = JSON.parse(fs.readFileSync(filename, "utf8"))
      return state ?? {}
    }
    return {}
  }

  public static getProfile() {
    const filename = path.join(process.env.VOPIDY_DB.toString(), ".vopidy-auth.json")

    if (fs.existsSync(filename)) {
      const state = JSON.parse(fs.readFileSync(filename, "utf8"))
      return state.profile ?? {}
    }

    return {}
  }

  public saveAuthUsers(id, state, profile) {
    const filename = path.join(process.env.VOPIDY_DB.toString(), ".vopidy-users.json")
    let users = {}
    if (fs.existsSync(filename)) {
      users = JSON.parse(fs.readFileSync(filename, "utf8"))
    }
    users[id] = { auth: state, profile: profile }
    fs.writeFileSync(filename, JSON.stringify(users, null, 2))
  }

  public getAuthUsers() {
    const filename = path.join(process.env.VOPIDY_DB.toString(), ".vopidy-users.json")
    let res = []

    if (!fs.existsSync(filename)) {
      return []
    }

    const users = JSON.parse(fs.readFileSync(filename, "utf8"))

    Object.keys(users).forEach((key) => {
      const user = users[key].profile
      res.push({
        id: user.id,
        name: user.display_name,
        image: user.images ? user.images[0].url : "",
        email: user.email,
      })
    })

    return res
  }

  public async login(id: string) {
    const filename = path.join(process.env.VOPIDY_DB.toString(), ".vopidy-users.json")
    const librespot = new LibrespotManager()
    let res: any = {}

    if (!fs.existsSync(filename)) {
      return undefined
    }

    const users = JSON.parse(fs.readFileSync(filename, "utf8"))

    if (!users[id]) {
      return undefined
    }

    res = users[id]
    this.saveAuthState(res.auth, res.profile)

    if (process.env.GOLIBRESPOT_AUTHMODE.toString() == "spotify_token") {
      await librespot.connectWithToken()
    }

    return res.profile
  }

  public logout() {
    const filename = path.join(process.env.VOPIDY_DB.toString(), ".vopidy-auth.json")

    if (!fs.existsSync(filename)) {
      return true
    }

    fs.unlinkSync(filename)
    return true
  }

  public async refreshToken(refresh_token) {
    const form: URLSearchParams = new URLSearchParams()
    form.append("refresh_token", refresh_token)
    form.append("grant_type", "refresh_token")
    const settings = {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.SPOTIFY_CLIENT_ID.toString() +
              ":" +
              process.env.SPOTIFY_CLIENT_SECRET.toString(),
          ).toString("base64"),
      },
      body: form.toString(),
    }

    const res = await fetch("https://accounts.spotify.com/api/token", settings)
    if (!res.ok) {
      let text = await res.text()
      if ((text && text == "") || !text) {
        text = res.statusText
      }

      logger.error(`Error in auth RefreshToken ${res.status} ${text}`)

      throw new HTTPException(401, { message: text })
    }

    const json = await res.json()
    json.scope = json.scope ?? spotifyScopes.join(" ")
    json.expires_in = json.expires_in ?? 3600
    json.refresh_token = json.refresh_token ?? refresh_token
    if (!json.expires_at) {
      const expiresIn = json.expires_in ?? 3600
      json.expires_at = new Date(Date.now() + Number.parseInt(expiresIn, 10) * 1000)
    }

    this.saveAuthState(json)
    const profile = await SpotifyAuth.getProfileByToken(json.access_token)
    if (profile) {
      this.saveAuthUsers(profile.id, json, profile)
      this.saveAuthState(json, profile)
    }
    return json
  }

  public async getAccessTokenOnly(forceRefresh = false) {
    const res = await this.getAccessToken(forceRefresh)
    return res.access_token
  }

  public async getAccessToken(forceRefresh = false) {
    const filename = path.join(process.env.VOPIDY_DB.toString(), ".vopidy-auth.json")

    const expired = (expires_at, expirationWindowSeconds = 0) => {
      return Date.parse(expires_at) - (Date.now() + expirationWindowSeconds * 1000) <= 0
    }

    if (!fs.existsSync(filename)) {
      throw new HTTPException(401, { message: "Unauthorized" })
      return undefined
    }

    let json = JSON.parse(fs.readFileSync(filename, "utf-8"))

    if (expired(json.auth.expires_at) || forceRefresh) {
      json.auth = await this.refreshToken(json.auth.refresh_token)
    }

    return json.auth
  }
}

export const getAccessTokenOnly = async (forceRefresh = false) => {
  const auth = new Auth()
  return await auth.getAccessTokenOnly(forceRefresh)
}
