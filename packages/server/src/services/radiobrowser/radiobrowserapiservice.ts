// RadioBrowserApiService.js

import { Http } from "@/core/http/"
import { RadioBrowserHostResolver } from "./radiobrowserhostresolver"

export class RadioBrowserApiService {
  constructor() {
    this.resolver = new RadioBrowserHostResolver()
  }

  /**
   * Helper to perform a GET request and handle host failure.
   * @param {string} endpoint The API endpoint (e.g., '/json/countries').
   * @param {URLSearchParams} params The query parameters.
   * @returns {Promise<object | null>} The JSON response or null on failure.
   */
  async get(endpoint, params) {
    const baseUrl = await this.resolver.getBaseUrl()
    if (!baseUrl) {
      console.error("No healthy Radio Browser host available.")
      return null
    }

    const url = `${baseUrl}${endpoint}?${params.toString()}`
    const res = await Http.get(url, true)

    if (!res.ok) {
      // Mark the host as bad if the API call fails
      this.resolver.markHostAsBad(baseUrl)
      return null
    }

    return res.response
  }

  async getCountries() {
    const params = new URLSearchParams()
    params.append("order", "name")
    params.append("hidebroken", "true")
    return this.get("/json/countries", params)
  }

  async getStates(country) {
    const params = new URLSearchParams()
    params.append("order", "name")
    params.append("hidebroken", "true")
    const endpoint = `/json/states/${encodeURIComponent(country)}/`
    return this.get(endpoint, params)
  }

  async getStationsByState(code, offset, limit, pageSSO) {
    const params = new URLSearchParams()
    if (pageSSO) {
      params.append("offset", offset.toString())
      params.append("limit", limit.toString())
    }
    params.append("order", "name")
    params.append("hidebroken", "true")
    const endpoint = `/json/stations/bystateexact/${encodeURIComponent(code)}`
    return this.get(endpoint, params)
  }

  async searchStations(query, offset, limit, pageSSO) {
    const params = new URLSearchParams()
    if (pageSSO) {
      params.append("offset", offset.toString())
      params.append("limit", limit.toString())
    }
    params.append("order", "name")
    params.append("hidebroken", "true")

    for (let key of Object.keys(query)) {
      params.append(key, query[key].toString())
    }
    const endpoint = `/json/stations/search`
    return this.get(endpoint, params)
  }

  async getStationByUUID(id) {
    const params = new URLSearchParams()
    params.append("uuids", id)
    const endpoint = `/json/stations/byuuid`
    return this.get(endpoint, params)
  }
}
