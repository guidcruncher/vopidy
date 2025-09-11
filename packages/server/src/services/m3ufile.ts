import { db } from "@/services/db"
import { Icons } from "@/services/icons"
import { M3uParser } from "m3u-parser-generator"

export class M3uFile {
  private static async toItemList(playlist: any) {
    const items = []
    const iconResolver = new Icons()
    for (let i = 0; i < playlist.medias.length; i++) {
      const media = playlist.medias[i]
      let item = {
        id: db.newUri(),
        url: media.location,
        image: media.attributes["tvg-logo"] ?? "",
        name: media.name,
        artist: media.attributes["tvg-name"] ?? "",
        type: "stream",
      }
      items.push(item)
    }

    return items
  }

  public static async fromString(text: string) {
    const parser = new M3uParser()
    const playlist = parser.parse(text)
    return await M3uFile.toItemList(playlist)
  }

  public static async fromUrl(url: string) {
    const res = await fetch(url)
    const urlbase = new URL(url)
    const urlbaseStr = `${urlbase.protocol}//${urlbase.host}`

    if (!res.ok) {
      return []
    }

    const text = await res.text()
    let items = await M3uFile.fromString(text)
    items.forEach((item) => {
      if (item.image != "") {
        if (
          !(
            item.image.toLowerCase().indexOf("http://") === 0 ||
            item.image.toLowerCase().indexOf("https://") === 0
          )
        ) {
          if (item.image.startsWith("/")) {
            item.image = `${urlbaseStr}${item.image}`
          } else {
            item.image = `${urlbaseStr}${urlbase.pathname.substring(0, urlbase.pathname.lastIndexOf("/"))}/${item.image}`
          }
        }
      }
    })
    return items
  }
}
