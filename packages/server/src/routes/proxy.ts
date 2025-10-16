import { Config } from "@/core/config"
import { logger } from "@/core/logger"
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

export const proxyRoute = new Hono()

proxyRoute.get("/", async (c) => {
  try {
    let contenttype = "image/webp"
    const url = Buffer.from(decodeURIComponent(c.req.query("u")), "base64").toString("ascii")
    let bytes = undefined
    const hash = crypto.createHash("sha256").update(url).digest("hex")

    if (isImageCacheEnabled()) {
      const cacheFile = path.join(process.env.VOPIDY_CACHE.toString() + "/", hash)
      if (fs.existsSync(cacheFile)) {
        bytes = fs.readFileSync(cacheFile)
      } else {
        const data = await fetch(url)
        if (data.ok) {
          const Sharp = new sharp(await data.bytes())
            .resize(300, 300, { fit: "contain" })
            .toFormat("webp")
            .toBuffer()
            .then((data) => {
              fs.writeFileSync(cacheFile, data)
              return c.body(data, { headers: { "Content-Type": "image/webp" } })
            })
        } else {
          return c.notFound()
        }
      }
    } else {
      const cdata = await fetch(url)
      if (cdata.ok) {
        const Sharp = new sharp(await cdata.bytes())
          .resize(300, 300, { fit: "contain" })
          .toFormat("webp")
          .toBuffer()
          .then((data) => {
            return c.body(data, { headers: { "Content-Type": "image/webp" } })
          })
      } else {
        return c.notFound()
      }
    }
  } catch (err) {
    logger.error("Error in proxy", err)
    c.status(404)
    return c.notFound()
  }
})
