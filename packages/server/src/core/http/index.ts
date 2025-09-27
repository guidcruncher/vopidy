import { HttpClient } from "@/core/http/httpclient"
import { Authorization, Body } from "@/core/http/utils"

export { Authorization, Body, BodyTransform, HttpResponse } from "@/core/http/utils"

export class Http {
  // Standard GET request
  public static async get(url: string, useCache: boolean = false) {
    if (useCache) {
      return await HttpClient.Cached().get(url)
    }
    return await HttpClient.NoCache().get(url)
  }

  // Standard POST request
  public static async post(url: string, body: Body) {
    return await HttpClient.NoCache().post(url, body)
  }

  // Standard PUT request
  public static async put(url: string, body: body) {
    return await HttpClient.NoCache().put(url, body)
  }

  // Standard DELETE request
  public static async delete(url: string) {
    return await HttpClient.NoCache().delete(url)
  }

  // Proxy GET request (e.g., from a web server)
  public static async proxy(context: any, url: string) {
    return await HttpClient.NoCache().proxy(context, url)
  }
}

export class HttpAuth {
  // Standard GET request
  public static async get(url: string, auth: Authorization, useCache: boolean = false) {
    if (useCache) {
      return await HttpClient.Cached().get(url, auth)
    }
    return await HttpClient.NoCache().get(url, auth)
  }

  // Standard POST request
  public static async post(url: string, body: Body, auth: Authorization) {
    return await HttpClient.NoCache().post(url, body, auth)
  }

  // Standard PUT request
  public static async put(url: string, Body: body, auth: Authorization) {
    return await HttpClient.NoCache().put(url, body, auth)
  }

  // Standard DELETE request
  public static async delete(url: string, auth: Authorization) {
    return await HttpClient.NoCache().delete(url, auth)
  }

  // Proxy GET request (e.g., from a web server)
  public static async proxy(context: any, url: string, auth: Authorization) {
    return await HttpClient.NoCache().proxy(context, url, auth)
  }
}
