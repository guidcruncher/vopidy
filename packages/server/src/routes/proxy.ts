import { Config } from "@/core/config"
import { logger } from "@/core/logger"
import * as crypto from "crypto"
import * as fs from "fs"
import { Hono } from "hono"
import Module from "node:module"
import * as path from "path"

const require = Module.createRequire(import.meta.url)
const sharp = require("sharp")

const isImageCacheEnabled = () => {
  const cfg: Config = Config.load()
  return cfg.enableImageCache
}

const fetchShim = async (url) => {
  if (!url.startsWith("/")) {
    return await fetch(url)
  }

  let filename = path.join(process.cwd(), "../client/public", url)

  if (process.env.NODE_ENV == "production") {
    filename = path.join(process.cwd(), "../client", url)
  }

  if (fs.existsSync(filename)) {
    return {
      local: true,
      ok: true,
      bytes: async () => {
        return fs.readFileSync(filename)
      },
    }
  }

  filename = path.join(process.env.VOPIDY_FILES, url.replace("/files", ""))
  if (fs.existsSync(filename)) {
    return {
      local: true,
      ok: true,
      bytes: async () => {
        return fs.readFileSync(filename)
      },
    }
  }

  logger.warn(`Not found ${filename}`)
  return { ok: false }
}

const getNotCached = async (c, url, size) => {
  const cdata = await fetchShim(url)
  if (cdata.ok) {
    const bytes = await cdata.bytes()
    const stats = await new sharp(bytes).stats()
    const data = await new sharp(bytes)
      .resize(size, size, { fit: "contain", background: stats.dominant })
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
  const size = c.req.query("s") ? parseInt(c.req.query("s")) : 300
  let bytes = undefined
  const hash = crypto.createHash("sha256").update(url).digest("hex")

  if (!isImageCacheEnabled()) {
    return getNotCached(c, url, size)
  }

  const cacheFile = path.join(process.env.VOPIDY_CACHE.toString() + "/", hash)

  if (fs.existsSync(cacheFile)) {
    bytes = fs.readFileSync(cacheFile)
  } else {
    const data = await fetchShim(url)
    if (data.ok) {
      bytes = await data.bytes()
      const stats = await new sharp(bytes).stats()
      bytes = await new sharp(bytes)
        .resize(300, 300, {
          fit: "contain",
          background: stats.isOpaque ? stats.dominant : { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .toFormat("webp")
        .toBuffer()
      if (!data.local) {
        fs.writeFileSync(cacheFile, bytes)
      }
    }
  }
  if (bytes) {
    if (size != 300) {
      const stats = await new sharp(bytes).stats()
      bytes = await new sharp(bytes)
        .resize(size, size, {
          fit: "contain",
          background: stats.isOpaque ? stats.dominant : { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .toFormat("webp")
        .toBuffer()
    }
    return c.body(bytes, { headers: { "Content-Type": "image/webp" } })
  }

  return c.notFound()
})
