import { Http } from "@/core/http/"
import { PagedItems } from "@/core/paging"
import { WsClientStore } from "@/core/wsclientstore"
import { db } from "@/services/db"
import { Mixer } from "@/services/mixer"

export class TuneIn {
  public async categories() {
    const url = `http://opml.radiotime.com/?render=json`
    const res = await Http.get(url, true)
    if (!res.ok) {
      return undefined
    }
    const data = []
    for (let i = 0; i < res.response.body.length; i++) {
      const value = res.response.body[i]
      data.push({ text: value.text, type: value.type, url: value.URL, id: value.key })
    }

    return data
  }

  private parseItem(value) {
    const item = { text: value.text, type: value.type, id: value.guide_id, url: "", image: "" }

    if (value.guide_id) {
      item.id = value.guide_id
    }
    if (value.URL) {
      item.url = value.URL + "&render=json"
    }
    if (value.image) {
      item.image = value.image
    }
    return item
  }

  private parseChildren(arr: any[], child: any[]) {
    for (let i = 0; i < child.length; i++) {
      const value = child[i]
      if (value.element === "outline" && value.children) {
        arr = this.parseChildren(arr, value.children)
      } else {
        if (value.type && value.guide_id) {
          arr.push(this.parseItem(value))
        }
      }
    }

    return arr
  }

  public async browse(id: string) {
    const params = new URLSearchParams()
    params.append("render", "json")
    params.append("id", id)
    const url = `http://opml.radiotime.com/browse.ashx?${params.toString()}`
    const res = await Http.get(url, true)
    if (!res.ok) {
      return undefined
    }

    let data = []
    data = this.parseChildren(data, res.response.body)
    if (data.length == 0) {
      return undefined
    }
    return data
  }

  public async describe(id: string) {
    const params = new URLSearchParams()
    params.append("render", "json")
    params.append("id", id)
    const url = `http://opml.radiotime.com/describe.ashx?${params.toString()}`
    const res = await Http.get(url, true)
    if (!res.ok) {
      return undefined
    }
    if (res.response.body.length > 0) {
      const json = res.response.body[0]
      const track = {
        id: json.guide_id,
        image: json.logo,
        album: json.description,
        name: json.name,
        artist: [{ name: json.slogan }],
        type: "tunein",
        source: "tunein",
      }
      return track
    }

    return undefined
  }

  public async play(id: string) {
    const params = new URLSearchParams()
    params.append("render", "json")
    params.append("id", id)
    const url = `http://opml.radiotime.com/tune.ashx?${params.toString()}`
    const item = await this.describe(id)

    const res = await Http.get(url, false)
    if (!res.ok) {
      return undefined
    }
    const json = res.response

    if (json.body.length > 0) {
      const mpdClient = Mixer.getMediaPlayer()
      Mixer.savePlaybackTrack("tunein", id)
      await mpdClient.play(json.body[0].url)
      db.addToPlaybackHistory("tunein", item)
      WsClientStore.broadcast({ type: "track-changed", data: item })
      return item
    }

    return undefined
  }

  public async search(query: string, offset: number, limit: number): Promise<PagedItems<any>> {
    let view = new PagedItems()
    const params = new URLSearchParams()
    params.append("fullTextSearch", "true")
    params.append("formats", "mp3,aac,ogg,flash,html,hls,wma")
    params.append("partnerId", "RadioTime")
    params.append("itemUrlScheme", "secure")
    params.append("reqAttempt", "1")
    params.append("query", query)
    const url = "https://api.tunein.com/profiles?" + params.toString()
    view.query = query
    const res = await Http.get(url, true)

    if (!res.ok) {
      return view
    }

    let items = []
    for (const item of res.response.Items) {
      if (item.ContainerType == "Stations") {
        item.Children.forEach((json) => {
          const track = {
            id: json.GuideId,
            image: json.Image,
            album: json.Description,
            name: json.Title,
            artist: [{ name: json.Subtitle }],
            nowplaying: json.Subtitle,
            type: "tunein",
            source: "tunein",
          }
          items.push(track)
        })
      }
    }

    view.offset = 0
    items = items.sort((a, b) => a.name.localeCompare(b.name))
    view.items = items
    view.limit = view.items.length
    view.total = view.items.length
    view.calculatePaging()
    return view
  }
}
