const host = "https://translate.google.com"

export class TtsSynthesizer {
  public async synthesize(lang: string, text: string): Promise<string> {
    const params = new URLSearchParams()

    params.append("ie", "UTF-8")
    params.append("q", text)
    params.append("tl", lang)
    params.append("client", "tw-ob")
    params.append("rd", Math.floor(Math.random() * 50000000).toString())
    return host + "/translate_tts?" + params.toString()
  }
}
