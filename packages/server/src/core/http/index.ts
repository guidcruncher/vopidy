import { Body, FetchCache, HttpClient } from "@/core/httpclient"

export class HttpFacade {
  // Standard GET request
  public static async get(url: string, useCache: boolean = false) {
    if (useCache) {
      return await FetchCache.fetch(url)
    }
    return await HttpClient.get(url)
  }

  // Standard POST request
  public static async post(url: string, data: any, contentType: "json" | "urlencoded" = "json") {
    let body
    if (contentType === "json") {
      body = Body.json(data)
    } else {
      body = Body.urlEncoded(data)
    }
    return await HttpClient.post(url, body)
  }

  // Standard PUT request
  public static async put(url: string, data: any, contentType: "json" | "urlencoded" = "json") {
    let body
    if (contentType === "json") {
      body = Body.json(data)
    } else {
      body = Body.urlEncoded(data)
    }
    return await HttpClient.put(url, body)
  }

  // Standard DELETE request
  public static async del(url: string) {
    return await HttpClient.del(url)
  }

  // Proxy GET request (e.g., from a web server)
  public static async proxy(context: any, url: string) {
    return await HttpClient.proxy(context, url)
  }
}
