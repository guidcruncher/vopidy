import { _fetchCache } from "@/core/http"
import { logger } from "@/core/logger"
import { PagedItems } from "@/core/paging"
import { WsClientStore } from "@/core/wsclientstore"
import { db } from "@/services/db"
import { Mixer } from "@/services/mixer"
import * as dns from "dns"
import * as util from "util"

const OneHourAgo = (date) => {
  const hour = 1000 * 60 * 60
  const hourago = Date.now() - hour

  return date <= hourago
}

const resolveSrv = util.promisify(dns.resolveSrv)

const badHosts = []
const getBaseUrl = async () => {
  let index = badHosts.findIndex((item) => OneHourAgo(item.date))
  while (index != -1) {
    badHosts.splice(index, 1)
    index = badHosts.findIndex((item) => OneHourAgo(item.date))
  }

  let host = ""
  let hosts = (await resolveSrv("_api._tcp.radio-browser.info"))
    .sort()
    .map((host) => `https://${host.name}`)
    .filter((host) => !badHosts.some((h) => h["host"] === host))

  while (hosts.length > 0) {
    index = Math.floor(Math.random() * hosts.length)
    host = hosts[index]
    const bad = badHosts.some((h) => h["host"] === host)
    try {
      logger.warn(`${host} of ${hosts.length}`)
      const res = await fetch(host)

      if (res.ok) {
        break
        return host
      }

      badHosts.push({ date: Date.now(), host: host })
      hosts = (await resolveSrv("_api._tcp.radio-browser.info"))
        .sort()
        .map((host) => `https://${host.name}`)
        .filter((host) => !badHosts.some((h) => h["host"] === host))
      host = ""
    } catch (err) {
      badHosts.push({ date: Date.now(), host: host })
      hosts = (await resolveSrv("_api._tcp.radio-browser.info"))
        .sort()
        .map((host) => `https://${host.name}`)
        .filter((host) => !badHosts.some((h) => h["host"] === host))
      host = ""
    }
  }
  return host
}

export class RadioBrowser {
  public async countries() {
    const baseUrl = await getBaseUrl()
    const params = new URLSearchParams()
    params.append("order", "name")
    params.append("hidebroken", "true")

    const url = `${baseUrl}/json/countries?${params.toString()}`
    const res = await _fetchCache(url, {
      method: "GET",
    })

    if (!res) {
      badHosts.push({ date: Date.now(), host: baseUrl })
      return []
    }
    let value = res.map((t) => {
      return {
        type: "country",
        id: t.iso_3166_1,
        name: t.name,
        image: `/flags/${t.iso_3166_1.toLowerCase()}.svg`,
      }
    })

    return value.sort((a, b) => {
      return a.name.localeCompare(b.name)
    })
  }

  public async states(code: string, country: string) {
    const baseUrl = await getBaseUrl()
    const params = new URLSearchParams()
    params.append("order", "name")
    params.append("hidebroken", "true")

    const url = `${baseUrl}/json/states/${encodeURIComponent(country)}/?${params.toString()}`
    const res = await _fetchCache(url, {
      method: "GET",
    })

    if (!res) {
      badHosts.push({ date: Date.now(), host: baseUrl })
      return []
    }
    let value = res.map((t) => {
      return {
        type: "region",
        id: t.name,
        name: t.name,
        image: `/flags/${code.toLowerCase()}.svg`,
      }
    })

    return value.sort((a, b) => {
      return a.name.localeCompare(b.name)
    })
  }

  public async browse(code: string, offset: number, limit: number, pageSSO: boolean = false) {
    const baseUrl = await getBaseUrl()
    const params = new URLSearchParams()
    if (pageSSO) {
      params.append("offset", offset.toString())
      params.append("limit", limit.toString())
    }
    params.append("order", "name")
    params.append("hidebroken", "true")
    const url = `${baseUrl}/json/stations/bystateexact/${encodeURIComponent(code)}?${params.toString()}`
    const res = await _fetchCache(url, {
      method: "GET",
    })

    if (!res) {
      badHosts.push({ date: Date.now(), host: baseUrl })
      return []
    }

    return res.map((json) => {
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
    })
  }

  public async advancedSearch(query: any, offset: number, limit: number, pageSSO: boolean = false) {
    const baseUrl = await getBaseUrl()
    const params = new URLSearchParams()
    let view = new PagedItems()
    if (pageSSO) {
      params.append("offset", offset.toString())
      params.append("limit", limit.toString())
    }
    params.append("order", "name")
    params.append("hidebroken", "true")
    for (let key of Object.keys(query)) {
      params.append(key, query[key].toString())
    }
    const url = `${baseUrl}/json/stations/search?${params.toString()}`
    const res = await _fetchCache(url, {
      method: "GET",
    })

    if (!res) {
      badHosts.push({ date: Date.now(), host: baseUrl })
      return view
    }

    view = this.view(res, offset, limit, res.length, pageSSO)
    view.calculatePaging()
    return view
  }

  private view(res: any[], offset: number, limit: number, total: number, pageSSO: boolean) {
    let data = new PagedItems()
    const items = []
    data.offset = offset
    data.limit = limit
    data.total = total
    for (let json of res) {
      const track = {
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
      items.push(track)
    }

    if (pageSSO) {
      data.total = 0
      data.items = items
      return data
    }

    if (offset + limit < res.length) {
      data.items = items.slice(offset, offset + limit)
    } else {
      data.items = items.slice(offset, res.length)
    }

    return data
  }

  public async describe(id: string) {
    const baseUrl = await getBaseUrl()
    const params = new URLSearchParams()
    params.append("uuids", id)
    const url = `${baseUrl}/json/stations/byuuid?${params.toString()}`
    const res = await _fetchCache(url, {
      method: "GET",
    })

    if (!res) {
      badHosts.push({ date: Date.now(), host: baseUrl })
      return undefined
    }

    if (res.length <= 0) {
      return undefined
    }

    const json = res[0]

    return {
      id: json.stationuuid,
      image: json.favicon,
      album: json.country,
      homepage: json.homepage,
      name: json.name,
      url: json.url_resolved,
      artist: [{ name: "" }],
      nowplaying: "",
      type: "radiobrowser",
      source: "radiobrowser",
    }
  }

  public async playTrack(id: string) {
    const item = await this.describe(id)

    if (item) {
      const mpdClient = Mixer.getMediaPlayer()
      Mixer.savePlaybackTrack("radiobrowser", id)
      await mpdClient.playTrackUrl(item.url)
      db.addToPlaybackHistory("radiobrowser", item)
      WsClientStore.broadcast({ type: "track-changed", data: item })
      return item
    }

    return undefined
  }

  public async search(query: string, offset: number, limit: number) {
    return await this.advancedSearch({ name: query }, offset, limit)
  }
}
