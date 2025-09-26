import { CacheManager } from "@/core/cachemanager"
import { HttpFacade } from "@/core/http/"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.stubGlobal("fetch", vi.fn())

describe("HttpFacade", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    CacheManager.get = vi.fn().mockResolvedValue(null)
    CacheManager.set = vi.fn().mockResolvedValue(undefined)
  })

  it("should perform GET request without cache", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      text: vi.fn().mockResolvedValue(JSON.stringify({ success: true })),
      headers: new Headers(),
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse as any)

    const res = await HttpFacade.get("https://example.com")
    expect(res.ok).toBe(true)
    expect(res.response).toEqual({ success: true })
  })

  it("should perform GET request with cache", async () => {
    const cachedData = JSON.stringify({ cached: true })
    CacheManager.get = vi.fn().mockResolvedValue(cachedData)

    const res = await HttpFacade.get("https://example.com", true)
    expect(res).toEqual({ cached: true })
  })

  it("should perform POST request with JSON body", async () => {
    const mockResponse = {
      ok: true,
      status: 201,
      statusText: "Created",
      text: vi.fn().mockResolvedValue("{}"),
      headers: new Headers(),
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse as any)

    const res = await HttpFacade.post("https://example.com", { name: "test" }, "json")
    expect(res.status).toBe(201)
  })

  it("should perform PUT request with JSON body", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      text: vi.fn().mockResolvedValue("{}"),
      headers: new Headers(),
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse as any)

    const res = await HttpFacade.put("https://example.com", { name: "update" })
    expect(res.status).toBe(200)
  })

  it("should perform DELETE request", async () => {
    const mockResponse = {
      ok: true,
      status: 204,
      statusText: "No Content",
      text: vi.fn().mockResolvedValue(""),
      headers: new Headers(),
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse as any)

    const res = await HttpFacade.del("https://example.com")
    expect(res.status).toBe(204)
  })
})
