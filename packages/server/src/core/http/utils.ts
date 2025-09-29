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

export type AuthorizationFunc = () => Promise<Authorization>

export class Body {
  static json(data: any): BodyTransform {
    return { body: JSON.stringify(data), contentType: "application/json" }
  }

  static urlEncoded(params: URLSearchParams): BodyTransform {
    return { body: params.toString(), contentType: "application/x-www-form-urlencoded" }
  }

  static xmlEncoded(xml: Document): BodyTransform {
    const s = new XMLSerializer()
    return { body: s.serializeToString(xml), contentType: "text/xml" }
  }

  static empty(): BodyTransform {
    return { body: "", contentType: "application/json" }
  }
}

export interface Fetch {
  execute(req: Request, auth?: AuthorizationFunc): Promise<HttpResponse>
}
