import * as htmlparser2 from "htmlparser2"

export class Icons {
  public async getMediaIconUrl(name: string): Promise<string> {
    const id: string = name.replaceAll(" ", "-").toLowerCase()
    const url: string = "https://media.info/radio/stations/" + id
    let iconurl = ""
    const result = await fetch(url, { method: "GET" })

    if (!result.ok) {
      return ""
    }

    const html = await result.text()

    const parser = new htmlparser2.Parser({
      onopentag(name, attributes) {
        if (name === "meta" && attributes.property === "og:image") {
          if (attributes.content.startsWith("http")) {
            iconurl = attributes.content
          } else {
            iconurl = "https://media.info" + attributes.content
          }
        }
      },
    })
    parser.write(html)
    parser.end()
    return iconurl
  }
}
