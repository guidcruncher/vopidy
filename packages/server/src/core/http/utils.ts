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

export interface Fetch {
  execute(req: Request, auth?: Authorization): Promise<HttpResponse>
}
