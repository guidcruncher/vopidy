import { Config } from "@/core/config"
import { logger } from "@/core/logger"
import * as crypto from "crypto"
import * as fs from "fs"
import { Hono } from "hono"
import * as path from "path"

const isImageCacheEnabled = () => {
  const cfg: Config = Config.load()
  return cfg.enableImageCache
}

export const proxyRoute = new Hono()

proxyRoute.get("/", async (c) => {
  try {
    let contenttype = ""
    const url = Buffer.from(decodeURIComponent(c.req.query("u")), "base64").toString("ascii")
    let bytes = undefined
    const hash = crypto.createHash("sha256").update(url).digest("hex")

    if (isImageCacheEnabled()) {
      const cacheFile = path.join(process.env.VOPIDY_CACHE.toString() + "/", hash)
      if (fs.existsSync(cacheFile)) {
        const json = JSON.parse(fs.readFileSync(cacheFile, "utf8"))
        bytes = Buffer.from(json.b, "base64")
        contenttype = json.c
      } else {
        const data = await fetch(url)
        if (data.ok) {
          c.header("Content-Type", data.headers.get("Content-Type"))
          contenttype = data.headers.get("Content-Type")
          bytes = await data.bytes()
          const value = { b: Buffer.from(bytes).toString("base64"), c: contenttype }
          fs.writeFileSync(cacheFile, JSON.stringify(value))
        } else {
          logger.error(`Proxy error: ${url} not found.`)
          return c.notFound()
        }
      }
    } else {
      const cdata = await fetch(url)
      if (cdata.ok) {
        c.header("Content-Type", cdata.headers.get("Content-Type"))
        contenttype = cdata.headers.get("Content-Type")
        bytes = await cdata.bytes()
      } else {
        logger.error(`Proxy error: ${url} not found.`)
        return c.notFound()
      }
    }

    return c.body(bytes, {
      headers: { "Content-Type": contenttype },
    })
  } catch (err) {
    logger.error("Error in proxy", err)
    c.status(404)
    return c.notFound()
  }
})
