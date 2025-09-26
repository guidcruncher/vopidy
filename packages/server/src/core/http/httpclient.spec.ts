// tests/http.spec.ts
import { CacheManager } from "@/core/cachemanager"
import { Body, FetchCache, HttpClient } from "@/core/http"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.stubGlobal("fetch", vi.fn())

describe("HttpClient", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("should create JSON body", () => {
    const body = { foo: "bar" }
    const result = Body.json(body)
    expect(result).toEqual({ body: JSON.stringify(body), contentType: "application/json" })
  })

  it("should perform GET request and parse JSON", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      text: vi.fn().mockResolvedValue(JSON.stringify({ success: true })),
      headers: new Headers(),
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse as any)

    const res = await HttpClient.get("https://example.com")
    expect(res.ok).toBe(true)
    expect(res.response).toEqual({ success: true })
  })

  it("should handle fetch errors gracefully", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error"))
    const res = await HttpClient.get("https://example.com")
    expect(res.ok).toBe(false)
    expect(res.status).toBe(500)
  })

  it("should send POST request with body", async () => {
    const mockResponse = {
      ok: true,
      status: 201,
      statusText: "Created",
      text: vi.fn().mockResolvedValue("{}"),
      headers: new Headers(),
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse as any)

    const body = Body.json({ name: "test" })
    const res = await HttpClient.post("https://example.com", body)
    expect(res.status).toBe(201)
  })
})

describe("FetchCache", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    CacheManager.get = vi.fn().mockResolvedValue(null)
    CacheManager.set = vi.fn().mockResolvedValue(undefined)
  })

  it("should fetch and cache response", async () => {
    const mockData = { foo: "bar" }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue(JSON.stringify(mockData)),
      headers: new Headers(),
    } as any)

    const res = await FetchCache.fetch("https://example.com")
    expect(res).toEqual(mockData)
    expect(CacheManager.set).toHaveBeenCalled()
  })

  it("should return cached data if available", async () => {
    const cachedData = JSON.stringify({ cached: true })
    CacheManager.get = vi.fn().mockResolvedValue(cachedData)
    const res = await FetchCache.fetch("https://example.com")
    expect(res).toEqual({ cached: true })
  })
})
