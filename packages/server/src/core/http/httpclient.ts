import { Config } from "@/core/config"
import { CachedFetch, NoCacheFetch } from "@/core/http/fetch"
import { Authorization, BodyTransform, Fetch, HttpResponse } from "@/core/http/utils"
import { Context } from "hono"

export class HttpClient {
  private _send: Fetch

  private constructor(fetchInstance: Fetch) {
    this._send = fetchInstance
  }

  public static NoCache(): HttpClient {
    return new HttpClient(new NoCacheFetch())
  }

  public static Cached(): HttpClient {
    const cfg = Config.load()
    if (!cfg.enableRequestCache) {
      return new HttpClient(new NoCacheFetch())
    }

    return new HttpClient(new CachedFetch())
  }

  public async get(url: string, auth?: Authorization) {
    return this._send.execute(
      new Request(url, {
        method: "GET",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      }),
      auth,
    )
  }

  public async post(url: string, body: BodyTransform, auth?: Authorization) {
    return this._send.execute(
      new Request(url, {
        method: "POST",
        body: body.body || undefined,
        headers: { "Content-Type": body.contentType, Accept: "application/json" },
      }),
      auth,
    )
  }

  public async put(url: string, body: BodyTransform, auth?: Authorization) {
    return this._send.execute(
      new Request(url, {
        method: "PUT",
        body: body.body || undefined,
        headers: { "Content-Type": body.contentType, Accept: "application/json" },
      }),
      auth,
    )
  }

  public async delete(url: string, auth?: Authorization) {
    return this._send.execute(
      new Request(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      }),
      auth,
    )
  }

  public async proxy(context: Context, url: string, auth?: Authorization) {
    const uri = new URL(context.req.url)
    const req = new Request(url, {
      method: "GET",
      headers: {
        "User-Agent": context.req.header("User-Agent"),
        "X-Forwarded-Proto": uri.protocol,
        "X-Forwarded-Host": context.req.header("host"),
      },
    })
    return this._send.execute(req, auth)
  }

  public async error(context: any, res: HttpResponse) {
    context.status(res.status)
    return context.json({ status: res.status, statusText: res.statusText })
  }
}
