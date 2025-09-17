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

export class http {
  public static JsonBody(body: any): BodyTransform {
    return { body: JSON.stringify(body), contentType: "application/json" }
  }

  public static urlEncodedBody(params: URLSearchParams): BodyTransform {
    return {
      body: params.toString(),
      contentType: "application/x-www-form-urlencoded",
    }
  }

  public static EmptyBody(): BodyTransform {
    return { body: "", contentType: "application/json" }
  }

  private static async __fetch(req: Request, auth?: Authorization) {
    if (auth) {
      req.headers.append("Authorization", `${auth.type} ${auth.value}`)
    }

    let res: any = {}
    try {
      res = await fetch(req)
    } catch (err) {
      logger.error("fetch error", err)
      const exerr: HttpResponse = {
        status: 500,
        statusText: err.message,
        ok: false,
        response: {},
      }
      return exerr
    }

    if (!res.ok) {
      let errorRes: any = {}
      try {
        errorRes = await res.json()
      } catch {
        errorRes = {}
      }
      const err: HttpResponse = {
        status: res.status ?? 500,
        statusText: errorRes.message ?? res.statusText ?? "",
        ok: res.ok ?? false,
        response: {},
      }
      logger.error(`Error in http ${req.method} ${req.url}`, err)
      return err
    }

    const result: HttpResponse = {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      response: {},
    }

    if (![201, 204].includes(res.status)) {
      const ctype =
        res.headers.get("content-type") ?? res.headers.get("Content-Type") ?? "application/json"

      if (ctype.includes("application/json")) {
        const json = await res.text()
        result.response = {}
        if (json != "") {
          result.response = JSON.parse(json)
        }
        return result
      }

      if (ctype.includes("text/")) {
        result.response = await res.text()
        return result
      }

      result.response = await res.bytes()
      return result
    }
    return result
  }

  public static error(context: any, res: HttpResponse) {
    context.status(res.status)
    return context.json({ status: res.status, statusText: res.statusText })
  }

  public static async get(url: string, auth?: Authorization) {
    const req: Request = new Request(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accepts: "application/json",
      },
    })

    return await http.__fetch(req, auth)
  }

  public static async proxy(c: Context, url: string, auth?: Authorization) {
    const uri: URL = new URL(c.req.url)
    const req: Request = new Request(url, {
      method: "GET",
      headers: {
        "User-Agent": c.req.header("User-Agent"),
        "X-Forwarded-Proto": uri.protocol,
        "X-Forwarded-Host": c.req.header("host"),
      },
    })

    return await http.__fetch(req, auth)
  }

  public static async put(url: string, bodyTransform: BodyTransform, auth?: Authorization) {
    let req: Request

    if (bodyTransform.body == "") {
      req = new Request(url, {
        method: "PUT",
        headers: { Accepts: "application/json" },
      })
    } else {
      req = new Request(url, {
        method: "PUT",
        body: bodyTransform.body,
        headers: {
          "Content-Type": bodyTransform.contentType,
          Accepts: "application/json",
        },
      })
    }

    return await http.__fetch(req, auth)
  }

  public static async post(url: string, bodyTransform: BodyTransform, auth?: Authorization) {
    let req: Request

    if (bodyTransform.body == "") {
      req = new Request(url, {
        method: "POST",
        headers: { Accepts: "application/json" },
      })
    } else {
      req = new Request(url, {
        method: "POST",
        body: bodyTransform.body,
        headers: {
          "Content-Type": bodyTransform.contentType,
          Accepts: "application/json",
        },
      })
    }

    return await http.__fetch(req, auth)
  }

  public static async del(url: string, auth?: Authorization) {
    const req: Request = new Request(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accepts: "application/json",
      },
    })

    return await http.__fetch(req, auth)
  }
}

export const _fetch = async (url, opts: any = {}) => {
  let res: any = {}
  try {
    res = await fetch(url, opts)
  } catch (err) {
    logger.error("fetch error", err)
    res = {
      ok: false,
      status: 500,
      statusText: err.message,
      json: () => {
        return {}
      },
    }
  }

  if (!res.ok) {
    let errorRes: any = {}
    try {
      errorRes = await res.json()
    } catch {
      errorRes = {}
    }
    const err: HttpResponse = {
      status: res.status,
      statusText: errorRes.message ?? res.statusText,
      ok: res.ok,
      response: {},
    }
    logger.error(`Error in http ${opts.method} ${url}`, err)
    return err
  }
  const text = await res.text()

  if (text && text != "") {
    return JSON.parse(text)
  }

  return {}
}

export const _fetchCache = async (url, opts: any = {}) => {
  const cfg: Config = Config.load()
  if (!cfg.enableRequestCache) {
    return await _fetch(url, opts)
  }

  const key = url + ":" + (Auth.getProfile().id ?? "")
  const hash = crypto.createHash("sha256").update(key).digest("hex")

  const data = await CacheManager.get(hash)
  if (!data) {
    const res = await fetch(url, opts)
    if (!res.ok) {
      logger.error("Fetch Error - not ok - " + JSON.stringify(res))
      return undefined
    }

    const json = await res.text()
    if (json && json.trim() != "") {
      try {
        const jsonObj = JSON.parse(json)
        if (jsonObj.error) {
          return {}
        } else {
          await CacheManager.set(hash, json)
          return jsonObj
        }
      } catch (err) {
        logger.error("Fetch Cache Error " + JSON.stringify(err))
        return {}
      }
    } else {
      return {}
    }
  } else {
    logger.trace("Cached " + url)
    return JSON.parse(data)
  }
}
