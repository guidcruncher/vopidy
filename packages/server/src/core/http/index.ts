import { HttpClient } from "@/core/http/httpclient"
import { Body as body } from "@/core/http/utils"

export class Body extends body {}

export class Http {
  // Standard GET request
  public static async get(url: string, useCache: boolean = false) {
    if (useCache) {
      return await HttpClient.Cached().get(url)
    }
    return await HttpClient.NoCache().get(url)
  }

  // Standard POST request
  public static async post(url: string, data: any, contentType: "json" | "urlencoded" = "json") {
    let body
    if (contentType === "json") {
      body = Body.json(data)
    } else {
      body = Body.urlEncoded(data)
    }

    return await HttpClient.NoCache().post(url, body)
  }

  // Standard PUT request
  public static async put(url: string, data: any, contentType: "json" | "urlencoded" = "json") {
    let body
    if (contentType === "json") {
      body = Body.json(data)
    } else {
      body = Body.urlEncoded(data)
    }

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
