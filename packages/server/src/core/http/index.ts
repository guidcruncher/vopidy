import { HttpClient } from "@/core/http/httpclient"
import { AuthorizationFunc, BodyTransform } from "@/core/http/utils"

export {
  Authorization,
  AuthorizationFunc,
  Body,
  BodyTransform,
  HttpResponse,
} from "@/core/http/utils"

export class Http {
  private _client: HttpClient

  private constructor(client: HttpClient) {
    this._client = client
  }

  public Authorize(auth: AuthorizationFunc): Http {
    this._client.Authorize(auth)
    return this
  }

  public static NoCache(): Http {
    return new Http(HttpClient.NoCache())
  }

  public static Cache(): Http {
    return new Http(HttpClient.Cache())
  }

  // Standard GET request
  public async get(url: string) {
    return await this._client.get(url)
  }

  // Standard POST request
  public async post(url: string, body: BodyTransform) {
    return await this._client.post(url, body)
  }

  // Standard PUT request
  public async put(url: string, body: BodyTransform) {
    return await this._client.put(url, body)
  }

  // Standard DELETE request
  public async delete(url: string) {
    return await this._client.delete(url)
  }

  // Proxy GET request (e.g., from a web server)
  public async proxy(context: any, url: string) {
    return await this._client.proxy(context, url)
  }
}
