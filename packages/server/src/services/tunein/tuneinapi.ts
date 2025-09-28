// tunein-api.ts

import { Http } from "@/core/http/"

// Define a basic interface for the items returned by the API
interface TuneInItem {
  text: string
  type: string
  url: string
  id: string
  image?: string
}

export class TuneInApi {
  private readonly baseUrl = "http://opml.radiotime.com"
  private readonly searchUrl = "https://api.tunein.com/profiles"

  /**
   * Helper to parse a single item from the radiotime OPML-like JSON structure.
   */
  private parseItem(value: any): TuneInItem {
    const item: TuneInItem = {
      text: value.text,
      type: value.type,
      id: value.guide_id || value.key,
      url: "",
      image: "",
    }

    if (value.URL) {
      // Append render=json for subsequent API calls
      item.url = value.URL + (value.URL.includes("?") ? "&" : "?") + "render=json"
    }
    if (value.image) {
      item.image = value.image
    }
    return item
  }

  /**
   * Recursive helper to flatten the nested 'outline' structure (used for browse results).
   */
  private parseChildren(arr: TuneInItem[], children: any[]): TuneInItem[] {
    for (const value of children) {
      if (value.element === "outline" && value.children) {
        arr = this.parseChildren(arr, value.children)
      } else if (value.type && value.guide_id) {
        arr.push(this.parseItem(value))
      }
    }
    return arr
  }

  /**
   * Fetches the top-level categories.
   */
  public async getCategories(): Promise<TuneInItem[] | undefined> {
    const url = `${this.baseUrl}/?render=json`
    const res = await Http.get(url, true)

    if (!res.ok) {
      return undefined
    }

    // Response body is an array of categories
    return res.response.body.map((value: any) => this.parseItem(value))
  }

  /**
   * Browses a specific category or station list by ID.
   */
  public async browse(id: string): Promise<TuneInItem[] | undefined> {
    const params = new URLSearchParams()
    params.append("render", "json")
    params.append("id", id)
    const url = `${this.baseUrl}/browse.ashx?${params.toString()}`

    const res = await Http.get(url, true)
    if (!res.ok) {
      return undefined
    }

    const data: TuneInItem[] = []
    const flatData = this.parseChildren(data, res.response.body)

    return flatData.length > 0 ? flatData : undefined
  }

  /**
   * Gets descriptive metadata for a specific station ID.
   */
  public async describe(id: string): Promise<any | undefined> {
    const params = new URLSearchParams()
    params.append("render", "json")
    params.append("id", id)
    const url = `${this.baseUrl}/describe.ashx?${params.toString()}`

    const res = await Http.get(url, true)
    if (!res.ok || res.response.body.length === 0) {
      return undefined
    }

    const json = res.response.body[0]
    return {
      id: json.guide_id,
      image: json.logo,
      album: json.description,
      name: json.name,
      artist: [{ name: json.slogan }],
      type: "tunein",
      source: "tunein",
    }
  }

  /**
   * Gets the stream URL for a specific station ID.
   */
  public async getStreamUrl(id: string): Promise<string | undefined> {
    const params = new URLSearchParams()
    params.append("render", "json")
    params.append("id", id)
    const url = `${this.baseUrl}/tune.ashx?${params.toString()}`

    const res = await Http.get(url, false) // Note: original code uses 'false' here
    if (!res.ok || res.response.body.length === 0) {
      return undefined
    }

    return res.response.body[0].url
  }

  /**
   * Searches the TuneIn API for stations.
   */
  public async search(query: string): Promise<any[]> {
    const params = new URLSearchParams()
    params.append("fullTextSearch", "true")
    params.append("formats", "mp3,aac,ogg,flash,html,hls,wma")
    params.append("partnerId", "RadioTime")
    params.append("itemUrlScheme", "secure")
    params.append("reqAttempt", "1")
    params.append("query", query)
    const url = `${this.searchUrl}?${params.toString()}`

    const res = await Http.get(url, true)

    if (!res.ok || !res.response.Items) {
      return []
    }

    let items: any[] = []
    for (const item of res.response.Items) {
      if (item.ContainerType === "Stations" && item.Children) {
        item.Children.forEach((json: any) => {
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

    // Sort the results alphabetically by name
    return items.sort((a, b) => a.name.localeCompare(b.name))
  }
}
