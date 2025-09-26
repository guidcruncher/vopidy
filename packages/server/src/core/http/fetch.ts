import { CacheManager } from "@/core/cachemanager"
import { Authorization, Fetch, HttpResponse } from "@/core/http/utils"
import { logger } from "@/core/logger"
import { Auth } from "@/services/auth"
import * as crypto from "crypto"

export class NoCacheFetch implements Fetch {
  public async execute(req: Request, auth?: Authorization): Promise<HttpResponse> {
    if (auth) {
      req.headers.append("Authorization", `${auth.type} ${auth.value}`)
    }

    let res: Response
    try {
      res = await fetch(req)
    } catch (err: any) {
      logger.error(`Fetch error ${req.method} ${req.url}`, err)
      return { status: 500, statusText: err.message, ok: false, response: {} }
    }

    const result: HttpResponse = {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      response: {},
    }

    if (!res.ok) {
      let errorRes: any = {}
      try {
        errorRes = await res.json()
      } catch {}
      logger.error(`HTTP error ${req.method} ${req.url}`, errorRes)
      return { ...result, statusText: errorRes.message ?? res.statusText }
    }

    if (![201, 204].includes(res.status)) {
      const ctype = res.headers.get("content-type") ?? "application/json"

      if (ctype.includes("application/json")) {
        const text = await res.text()
        result.response = text ? JSON.parse(text) : {}
      } else if (ctype.includes("text/")) {
        result.response = await res.text()
      } else {
        result.response = await res.arrayBuffer()
      }
    }

    return result
  }
}

export class CachedFetch {
  public async execute(req: Request, auth?: Authorization): Promise<HttpResponse> {
    const key = req.url + ":" + (Auth.getProfile().id ?? "")
    const hash = crypto.createHash("sha256").update(key).digest("hex")

    const cached = await CacheManager.get(hash)
    if (cached) {
      logger.trace(`Cache hit: ${req.url}`)
      const cachedResponse: HttpResponse = {
        status: 200,
        statusText: "OK",
        ok: true,
        response: JSON.parse(cached),
      }
      return cachedResponse
    }

    const fetcher = new NoCacheFetch()
    const res = await fetcher.execute(req, auth)

    if (res && res.ok) {
      await CacheManager.set(hash, JSON.stringify(res.response))
    }
    return res
  }
}
