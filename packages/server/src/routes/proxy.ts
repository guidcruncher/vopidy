import { Config } from "@/core/config"
import * as crypto from "crypto"
import * as fs from "fs"
import { Hono } from "hono"
import * as path from "path"

import Module from "node:module"

const require = Module.createRequire(import.meta.url)
const sharp = require("sharp")

const isImageCacheEnabled = () => {
  const cfg: Config = Config.load()
  return cfg.enableImageCache
}

const getNotCached = async (c, url) => {
  const cdata = await fetch(url)
  if (cdata.ok) {
    const data = await new sharp(await cdata.bytes())
      .resize(300, 300, { fit: "contain" })
      .toFormat("webp")
      .toBuffer()
    return c.body(data, { headers: { "Content-Type": "image/webp" } })
  }
  return c.notFound()
}

export const proxyRoute = new Hono()

proxyRoute.get("/", async (c) => {
  const contenttype = "image/webp"
  const url = Buffer.from(decodeURIComponent(c.req.query("u")), "base64").toString("ascii")
  let bytes = undefined
  const hash = crypto.createHash("sha256").update(url).digest("hex")

  if (!isImageCacheEnabled()) {
    return getNotCached(c, url)
  }

  const cacheFile = path.join(process.env.VOPIDY_CACHE.toString() + "/", hash)

  if (fs.existsSync(cacheFile)) {
    bytes = fs.readFileSync(cacheFile)
  } else {
    const data = await fetch(url)
    if (data.ok) {
      bytes = await new sharp(await data.bytes())
        .resize(300, 300, { fit: "contain" })
        .toFormat("webp")
        .toBuffer()

      fs.writeFileSync(cacheFile, bytes)
    }
  }
  if (bytes) {
    return c.body(bytes, { headers: { "Content-Type": "image/webp" } })
  }

  return c.notFound()
})
