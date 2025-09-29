import { Config } from "@/core/config"
import { CachedFetch, NoCacheFetch } from "@/core/http/fetch"
import { AuthorizationFunc, BodyTransform, Fetch, HttpResponse } from "@/core/http/utils"
import { Context } from "hono"

export class HttpClient {
  private _send: Fetch
  private _auth: AuthorizationFunc

  private constructor(fetchInstance: Fetch) {
    this._send = fetchInstance
    this._auth = undefined
  }

  public Authorize(auth: AuthorizationFunc): HttpClient {
    this._auth = auth
    return this
  }

  public static NoCache(): HttpClient {
    return new HttpClient(new NoCacheFetch())
  }

  public static Cache(): HttpClient {
    const cfg = Config.load()
    if (!cfg.enableRequestCache) {
      return new HttpClient(new NoCacheFetch())
    }

    return new HttpClient(new CachedFetch())
  }

  public async get(url: string) {
    return this._send.execute(
      new Request(url, {
        method: "GET",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      }),
      this._auth,
    )
  }

  public async post(url: string, body: BodyTransform) {
    return this._send.execute(
      new Request(url, {
        method: "POST",
        body: body.body || undefined,
        headers: { "Content-Type": body.contentType, Accept: "application/json" },
      }),
      this._auth,
    )
  }

  public async put(url: string, body: BodyTransform) {
    return this._send.execute(
      new Request(url, {
        method: "PUT",
        body: body.body || undefined,
        headers: { "Content-Type": body.contentType, Accept: "application/json" },
      }),
      this._auth,
    )
  }

  public async delete(url: string) {
    return this._send.execute(
      new Request(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      }),
      this._auth,
    )
  }

  public async proxy(context: Context, url: string) {
    const uri = new URL(context.req.url)
    const req = new Request(url, {
      method: "GET",
      headers: {
        "User-Agent": context.req.header("User-Agent"),
        "X-Forwarded-Proto": uri.protocol,
        "X-Forwarded-Host": context.req.header("host"),
      },
    })
    return this._send.execute(req, this._auth)
  }

  public async error(context: any, res: HttpResponse) {
    context.status(res.status)
    return context.json({ status: res.status, statusText: res.statusText })
  }
}
