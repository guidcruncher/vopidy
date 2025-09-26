import { CacheManager } from "@/core/cachemanager"
import { Config } from "@/core/config"
import { logger } from "@/core/logger"
import { Auth } from "@/services/auth"
import * as crypto from "crypto"
import { Context } from "hono"

export interface HttpResponse {
  status: number
  statusText: string
  ok: boolean
  response: any
}

export interface Authorization {
  type: string
  value: string
}

export interface BodyTransform {
  body: any
  contentType: string
}

export class Body {
  static json(data: any): BodyTransform {
    return { body: JSON.stringify(data), contentType: "application/json" }
  }

  static urlEncoded(params: URLSearchParams): BodyTransform {
    return { body: params.toString(), contentType: "application/x-www-form-urlencoded" }
  }

  static empty(): BodyTransform {
    return { body: "", contentType: "application/json" }
  }
}

export class HttpClient {
  private static async send(req: Request, auth: Authorization): Promise<HttpResponse> {
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

    // Handle response body
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

  static async get(url: string, auth: Authorization) {
    return this.send(
      new Request(url, {
        method: "GET",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      }),
      auth,
    )
  }

  static async post(url: string, body: BodyTransform, auth: Authorization) {
    return this.send(
      new Request(url, {
        method: "POST",
        body: body.body || undefined,
        headers: { "Content-Type": body.contentType, Accept: "application/json" },
      }),
      auth,
    )
  }

  static async put(url: string, body: BodyTransform, auth: Authorization) {
    return this.send(
      new Request(url, {
        method: "PUT",
        body: body.body || undefined,
        headers: { "Content-Type": body.contentType, Accept: "application/json" },
      }),
      auth,
    )
  }

  static async delete(url: string, auth: Authorization) {
    return this.send(
      new Request(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      }),
      auth,
    )
  }

  static async del(url: string, auth: Authorization) {
    return await HttpClient.delete(url, auth)
  }
  static async proxy(context: Context, url: string, auth: Authorization) {
    const uri = new URL(context.req.url)
    const req = new Request(url, {
      method: "GET",
      headers: {
        "User-Agent": context.req.header("User-Agent"),
        "X-Forwarded-Proto": uri.protocol,
        "X-Forwarded-Host": context.req.header("host"),
      },
    })
    return this.send(req, auth)
  }

  static async error(context: any, res: HttpResponse) {
    context.status(res.status)
    return context.json({ status: res.status, statusText: res.statusText })
  }
}

export class FetchCache {
  static async fetch(url: string, opts: any = {}) {
    const cfg = Config.load()
    if (!cfg.enableRequestCache) return this.fetchRaw(url, opts)

    const key = url + ":" + (Auth.getProfile().id ?? "")
    const hash = crypto.createHash("sha256").update(key).digest("hex")

    const cached = await CacheManager.get(hash)
    if (cached) {
      logger.trace(`Cache hit: ${url}`)
      return JSON.parse(cached)
    }

    const res = await this.fetchRaw(url, opts)
    if (res && res.ok) {
      await CacheManager.set(hash, JSON.stringify(res.response))
    }
    return res.response
  }

  private static async fetchRaw(url: string, opts: any = {}) {
    let res: any
    try {
      res = await fetch(url, opts)
    } catch (err) {
      logger.error(`Fetch error: ${opts.method} ${url}`, err)
      return { ok: false, status: 500, statusText: err.message, response: {} }
    }

    if (!res.ok) {
      const text = await res.text()
      logger.error(`Fetch failed: ${opts.method} ${url}`, text)
      return { ok: false, status: res.status, statusText: res.statusText, response: {} }
    }

    const text = await res.text()
    return text ? JSON.parse(text) : {}
  }
}
