import * as cp from "child_process"
import * as fs from "node:fs"
import * as path from "node:path"
import { Mixer } from "@/services/mixer"

export class Frequency {
  numid = 0
  min = 0
  max = 100
  steps = 1
  name = ""
  title = ""
  value = 0
}

export class MixerDesk {
  frequencies: Frequency[] = [] as Frequency[]

  device = ""

  add(numid: number, name: string, value: number, min = 0, max = 100, steps = 1) {
    this.frequencies.push({
      numid: numid,
      min: min,
      max: max,
      steps: steps,
      name: name,
      title: name.slice(name.indexOf(" ")).replaceAll(" Playback Volume", "").trim(),
      value: value,
    })
  }
}

export class Equaliser {
  private mixerDevice = (process.env.ALSA_MIXERDEVICE ?? "").toString()

  public static async initialise() {
    const state = Mixer.getPlaybackState()
    const m = new Equaliser()
    if (!state.mixer || !state.mixer.device) {
      const mixer = await m.getMixer()
      Mixer.setPlaybackState({ mixer: mixer })
      return mixer
    }
    const mixer = await m.updateMixer(state.mixer)
    return state.mixer
  }

  async save(name: string, description: string = "") {
    const mixer = await this.getMixer()
    const filename = name.replaceAll(" ", "") + "json"
    const fileContent = { name: name, filename: filename, description: description, mixer: mixer }
    const fullPath = path.join("/srv/files/mixerdesk/", filename)
    fs.writeFileSync(fullPath, JSON.stringify(fileContent), "utf8")
    return fileContent
  }

  async load(filename: string) {
    const fullPath = path.join("/srv/files/mixerdesk/", filename)
    const json = JSON.parse(fs.readFileSync(fullPath, "utf8"))
    await this.updateMixer(json.mixer)
    return json
  }

  async getMixer(): Promise<MixerDesk> {
    const equal: MixerDesk = await this.contents(this.mixerDevice)
    return equal
  }

  async updateMixer(mixer: MixerDesk) {
    for (let i = 0; i < mixer.frequencies.length; i++) {
      const f: Frequency = mixer.frequencies[i]
      await this.cset(this.mixerDevice, f.numid, f.value)
    }

    Mixer.setPlaybackState({ mixer: mixer })
    return mixer
  }

  async resetMixer(level: number) {
    const mixer = await this.getMixer()
    for (let i = 0; i < mixer.frequencies.length; i++) {
      const f: Frequency = mixer.frequencies[i]
      f.value = level
      await this.cset(this.mixerDevice, f.numid, f.value)
    }

    Mixer.setPlaybackState({ mixer: mixer })
    return mixer
  }

  private async cset(device: string, numid: number, value: number) {
    if (device == "") {return ""}
    return await this.amixer(["-D", device, "cset", `numid=${numid}`, `${value}`])
  }

  private async contents(device: string): Promise<MixerDesk> {
    if (device == "") {return  undefined}
    const ch = await this.amixer(["-D", device, "scontents"])
    const res = await this.amixer(["-D", device, "contents"])
    const contents = await this.parseContents(res, ch)
    contents.device = device
    return contents
  }

  private async amixer(params): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (!fs.existsSync("/usr/bin/amixer")) {
        resolve("")
        return
      }

      try {
        let stdout = ""
        let stderr = ""

        const amixer = cp.spawn("/usr/bin/amixer", params)

        amixer.stdout.on("data", (data) => {
          stdout += data.toString()
        })

        amixer.stderr.on("data", (data) => {
          stderr += data.toString()
        })

        amixer.on("close", (code) => {
          if (code === 0) {
            resolve(stdout)
          } else {
            reject(new Error(stderr))
          }
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  private async parseContents(data: string, controls: string): Promise<MixerDesk> {
    const m: MixerDesk = new MixerDesk()
    const channels: string[] = controls
      .split("\n")
      .map((a) => {
        return a.trim()
      })
      .filter((a) => {
        return a.startsWith("Playback channels:")
      })
      .map((a) => a.slice(18).split("-"))[0]
    const lines: string[] = data
      .split("\n")
      .filter((n) => n && n.trim() != "")
      .map((n) => {
        let v: string = n.trim()
        if (v.startsWith("; ") || v.startsWith(": ")) {
          v = v.slice(2)
        }
        return v
      })
    let i = 0

    while (i < lines.length) {
      if (lines[i].startsWith("num")) {
        const obj = {} as any
        const fields: string[] =
          `${lines[i]},${lines[i + 1].replaceAll("values", "channels")},${lines[i + 2].replaceAll(",", "_")}`
            .replaceAll("'", "")
            .split(",")
        fields.map((a) => {
          const b = a.split("=")
          if (b[0] == "values") {
            b[1] = b[1].replace("_", ",")
          }

          obj[b[0]] = b[1]
          return b
        })
        const f = new Frequency()
        f.numid = parseInt(obj["numid"])
        f.min = parseInt(obj["min"])
        f.max = parseInt(obj["max"])
        f.steps = parseInt(obj["step"])
        f.name = this.formatName(obj["name"]) ?? ""
        f.title = f.name.slice(f.name.indexOf(" ")).replaceAll(" Playback Volume", "").trim()
        let channels = obj["values"].split(",").map((v, index) => {
          return { name: "", value: parseInt(v) }
        })
        f.value = channels[0].value
        m.frequencies.push(f)
        i = i + 2
      }
      i = i + 1
    }

    return m
  }

  private formatName(s: string) {
    let text = s.replace("Playback Volume", "").slice(4)
    return text.trim()
  }
}
