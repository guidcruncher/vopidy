import { logger } from "@/core/logger"
import { Auth, spotifyScopes } from "@/services/auth"
import { LibrespotManager } from "@/services/spotify/librespotmanager"
import { SpotifyAuth } from "@/services/spotify/spotifyauth"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import * as fs from "node:fs"
import * as path from "node:path"

export const auth = new Hono()

auth.get("/", (c) => {
  const url = new URL(c.req.url)
  const auth = new Auth()
  const redirectUri =
    (process.env.BASE_PATH ?? `${url.protocol}//${url.host}`).toString() + "/api/auth/callback"
  const authorizationUri = auth.spotifyAuthClient.authorizeURL({
    redirect_uri: redirectUri,
    scope: spotifyScopes,
    state: "3(#0/!~",
    customParam: "prompt=login",
  })

  return c.redirect(authorizationUri, 302)
})

auth.get("/profile", async (c) => {
  const json = await SpotifyAuth.getProfile()
  return c.json(json)
})

auth.get("/profile/image", async (c) => {
  const json = await SpotifyAuth.getProfile()
  return c.redirect(json.images[0].url, 302)
})

auth.get("/refresh", async (c) => {
  const filename = path.join(process.env.VOPIDY_CONFIG.toString(), ".vopidy-auth.json")
  const auth = new Auth()
  if (!fs.existsSync(filename)) {
    throw new HTTPException(401, { message: "Unauthorized" })
    return undefined
  }

  const json = JSON.parse(fs.readFileSync(filename, "utf-8"))
  const accessToken = await auth.refreshToken(json.auth.refresh_token)

  return c.json(accessToken)
})

auth.get("/token", async (c) => {
  const auth = new Auth()
  const accessToken = await auth.getAccessToken()
  return c.json(accessToken)
})

auth.get("/callback", async (c) => {
  const url = new URL(c.req.url)
  const auth = new Auth()
  const redirectUri =
    (process.env.BASE_PATH ?? `${url.protocol}//${url.host}`).toString() + "/api/auth/callback"
  const options = {
    code: c.req.query("code"),
    redirect_uri: redirectUri,
    scope: spotifyScopes,
  }

  // try {
  const librespot = new LibrespotManager()
  const accessToken: any = await auth.spotifyAuthClient.getToken(options)
  auth.saveAuthState(accessToken)

  global.spotifyDeviceId = ""

  let t = {
    ...accessToken.token,
    ...{
      id: "",
    },
  }

  await librespot.connect("Vopidy", t.access_token)
  try {
    const profile = await SpotifyAuth.getProfileByToken(t.access_token)
    if (profile) {
      auth.saveAuthState(accessToken, profile)
      auth.saveAuthUsers(profile.id, accessToken, profile)
      t.id = profile.id
    }

    const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Vopidy</title>
  </head>
  <body>
    <script language="javascript" >
    localStorage.setItem("vopidy.id", "${t.id}");
    window.location.href = "/";
    </script>
  </body>
</html>`

    return c.html(html)
    //    return c.json(t)
  } catch (error) {
    logger.error("Error during auth callback", error)
    return c.json(error.output)
  }
})
