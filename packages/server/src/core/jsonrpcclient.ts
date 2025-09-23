import { logger } from "@/core/logger"

export class jsonrpcclient {
  private static randomInt(max: number = 65535) {
    const min = Math.ceil(1)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  public static async request(method: string, params: any) {
    let res: any = {}
    const id = randomInt()
    const body = {
      id: id,
      jsonrpc: "2.0",
      method: method,
      params: params,
    }

    try {
      res = await fetch("http://127.0.0.1:1070/jsonrpc", {
        method: "POST",
        body: JSON.stringify(body),
      })
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
      logger.error(`Error in jsonrpcclient`, err)
      return err
    }
    const text = await res.text()

    if (text && text != "") {
      const obj = JSON.parse(text)
      if (obj.error) {
        return { ok: false, result: obj.error.data }
      }

      return { ok: true, result: obj.result }
    }

    return { ok: true, result: {} }
  }
}
