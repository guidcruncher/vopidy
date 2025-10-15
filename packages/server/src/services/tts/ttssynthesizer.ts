const host = "https://translate.google.com"

export class TtsSynthesizer {
  public async synthesize(lang: string, text: string): Promise<string> {
    const params = new URLSearchParams()

    params.append("ie", "UTF-8")
    params.append("q", text)
    params.append("tl", lang)
    params.append("total", 1)
    params.append("idx", 0)
    params.append("textlen", text.length)
    params.append("client", "tw-ob")
    params.append("prev", "input")
    params.append("ttsspeed", 1)
    return host + "/translate_tts?" + params.toString()
  }
}
