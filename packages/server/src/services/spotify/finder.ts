import { Authorization, HttpAuth } from "@/core/http/"
import { PagedItems } from "@/core/paging"
import { getAccessTokenOnly } from "@/services/auth"

export class SpotifyFinder {
  public async keyword(
    catalog: string,
    query: string,
    offset: number,
    limit: number,
    market: string,
  ): Promise<PagedItems<any>> {
    let view = new PagedItems()
    const auth: Authorization = { type: "Bearer", value: await getAccessTokenOnly() }
    const params = new URLSearchParams()
    params.append("q", query)
    params.append("limit", limit.toString())
    params.append("offset", offset.toString())
    params.append("market", market)
    params.append("type", catalog)
    const url = `https://api.spotify.com/v1/search?${params.toString()}`
    view.query = query
    const res = await HttpAuth.get(url, auth, true)
    if (!res.ok) {
      return view
    }

    const json = res.response[`${catalog.toLowerCase()}s`]

    if (!json) {
      return view
    }

    view.offset = json.offset
    view.limit = json.limit
    view.total = json.total

    for (let value of json.items) {
      let viewitem: any = {}
      switch (catalog) {
        case "album":
          viewitem = {
            id: value.uri,
            image: value.images ? value.images[0].url : "",
            name: value.name,
            artist: value.artists
              ? value.artists.map((t) => {
                  return { id: t.id, name: t.name }
                })
              : [],
            popularity: value.popularity,
            type: value.type,
          }
          break
        case "artist":
          viewitem = {
            id: value.uri,
            type: value.type,
            image: value.images ? (value.images.length > 0 ? value.images[0].url : "") : "",
            name: value.name,
            popularity: value.popularity,
            genres: value.genres,
            href: value.href,
            external_urls: value.external_urls,
          }
          break
        case "playlist":
          viewitem = {
            id: value.uri,
            image: value.images ? value.images[0].url : "",
            name: value.name,
            owner: value.owner ? value.owner.display_name : "",
            type: value.type,
          }
          break
        case "track":
          viewitem = {
            id: value.uri,
            image: value.album.images ? value.album.images[0].url : "",
            is_playable: value.is_playable,
            name: value.name,
            artist: value.artists
              ? value.artists.map((t) => {
                  return { id: t.id, name: t.name }
                })
              : [],
            popularity: value.popularity,
            type: value.type,
          }
          break
        case "show":
          viewitem = {
            id: value.uri,
            image: value.images ? value.images[0].url : "",
            name: value.name,
            artist: [{ name: value.publisher }],
            publisher: value.publisher,
            description: value.description,
            type: value.type,
          }
          break
        case "episode":
          viewitem = {
            id: value.uri,
            image: value.images ? value.images[0].url : "",
            album: value.show.nane,
            name: value.name,
            artist: [{ name: value.show.publisher }],
            type: value.type,
            publisher: value.show.publisher,
          }
          break
      }

      viewitem.source = "spotify"
      view.items.push(viewitem)
    }

    view.calculatePaging()
    return view
  }
}
