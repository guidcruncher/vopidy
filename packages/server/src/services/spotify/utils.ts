import { SpotifyAuth } from "./spotifyauth"

export function getCodeImageUrl(uri: string, color = "533191", whiteBar: boolean = true) {
  const barColor = whiteBar ? "white" : "black"
  const segments = uri.split(":")
  if (segments[1] === "playlist") {
    return `https://scannables.scdn.co/uri/plain/svg/${color}/${barColor}/1080/spotify:user:${uri}`
  }
  return `https://scannables.scdn.co/uri/plain/svg/${color}/${barColor}/1080/${uri}`
}

export function extractId(id: string): string {
  if (!id) return ""
  return id.includes(":") ? id.split(":")[2] : id
}

export function extractType(id: string): string {
  if (!id) return ""
  return id.includes(":") ? id.split(":")[1] : id
}

export async function getMarket() {
  const res = await SpotifyAuth.getProfile()
  if (res.ok) {
    return res.response.market
  }
  return ""
}

export async function getMarketUrlParam() {
  const res = await SpotifyAuth.getProfile()
  if (res.ok) {
    return `market=${res.response.market}`
  }
  return ""
}

export function filterImageUrl(img: any[]) {
  if (!img || img.length <= 0) {
    return ""
  }
  const sorted = img.sort((a, b) => {
    return b.width - a.width
  })

  return sorted[0].url
}

export function chunkArray(array, chunkSize) {
  return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, index) =>
    array.slice(index * chunkSize, (index + 1) * chunkSize),
  )
}
