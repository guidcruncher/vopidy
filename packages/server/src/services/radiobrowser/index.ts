// RadioBrowserService.js

import { PagedItems } from "@/core/paging"
import { WsClientStore } from "@/core/wsclientstore"
import { db } from "@/services/db"
import { Mixer } from "@/services/mixer"
import { RadioBrowserApiService } from "./radiobrowserapiservice"

export class RadioBrowserService {
  constructor() {
    this.apiService = new RadioBrowserApiService()
  }

  /**
   * Transforms a single raw Radio Browser station JSON into the application's track format.
   * @param {object} json Raw station JSON.
   * @returns {object} Application track object.
   */
  _transformStation(json) {
    return {
      id: json.stationuuid,
      image: json.favicon,
      album: json.country,
      homepage: json.homepage,
      name: json.name,
      url: json.url_resolved,
      artist: [{ name: `${json.codec} ${json.bitrate}` }],
      nowplaying: "",
      type: "radiobrowser",
      source: "radiobrowser",
    }
  }

  /**
   * Helper to create a PagedItems view from raw data.
   */
  _createPagedView(res, offset, limit, pageSSO) {
    let data = new PagedItems()
    const items = res.map(this._transformStation)

    data.offset = offset
    data.limit = limit
    data.total = pageSSO ? 0 : res.length // RadioBrowser API sometimes returns all results, so total is length unless pageSSO is true

    if (pageSSO) {
      // API handled the pagination
      data.items = items
    } else {
      // We handle local pagination
      data.items = items.slice(offset, offset + limit)
    }

    data.calculatePaging()
    return data
  }

  // --- Public API Methods ---

  public async countries() {
    const res = await this.apiService.getCountries()
    if (!res) return []

    let value = res.map((t) => ({
      type: "country",
      id: t.iso_3166_1,
      name: t.name,
      image: `/flags/${t.iso_3166_1.toLowerCase()}.svg`,
    }))

    return value.sort((a, b) => a.name.localeCompare(b.name))
  }

  public async states(code, country) {
    const res = await this.apiService.getStates(country)
    if (!res) return []

    let value = res.map((t) => ({
      type: "region",
      id: t.name,
      name: t.name,
      image: `/flags/${code.toLowerCase()}.svg`,
    }))

    return value.sort((a, b) => a.name.localeCompare(b.name))
  }

  public async browse(code, offset, limit, pageSSO = false) {
    const res = await this.apiService.getStationsByState(code, offset, limit, pageSSO)
    if (!res) return []

    return res.map(this._transformStation)
  }

  public async advancedSearch(query, offset, limit, pageSSO = false) {
    const res = await this.apiService.searchStations(query, offset, limit, pageSSO)
    if (!res) return new PagedItems()

    return this._createPagedView(res, offset, limit, pageSSO)
  }

  public async search(query, offset, limit) {
    return this.advancedSearch({ name: query }, offset, limit)
  }

  public async describe(id) {
    const res = await this.apiService.getStationByUUID(id)
    if (!res || res.length === 0) {
      return undefined
    }

    return this._transformStation(res[0])
  }

  public async play(id) {
    const item = await this.describe(id)

    if (item) {
      const mpdClient = Mixer.getMediaPlayer()
      Mixer.savePlaybackTrack("radiobrowser", id)
      await mpdClient.play(item.url)
      db.addToPlaybackHistory("radiobrowser", item)
      WsClientStore.broadcast({ type: "track-changed", data: item })
      return item
    }

    return undefined
  }
}
