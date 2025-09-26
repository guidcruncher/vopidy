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
