import { spawn } from "node:child_process"

export class Alsa {
  public async getCardInfo() {
    let res: any[] = []

    const aplay = () => {
      let d = ""
      const p = spawn("aplay", ["-l"])
      return new Promise((resolveFunc) => {
        p.stdout.on("data", (x) => {
          d += x.toString()
        })
        p.on("exit", (code) => {
          resolveFunc(d)
        })
      })
    }

    let cards = ((await aplay()) as any).split("\n")
    for (let line of cards) {
      if (line.startsWith("card ")) {
        let args = line.split(",")
        if (args[0].startsWith("card")) {
          args[0] = args[0].trim().slice(4).trim()
          const cardinfo = args[0].split(":")
          if (args[1].trim().startsWith("device")) {
            args[1] = args[1].trim().slice(6)
            const devinfo = args[1].split(":")
            res.push({
              address: `hw:${cardinfo[0].trim()},${devinfo[0].trim()}`,
              cardid: parseInt(cardinfo[0].trim()),
              card: cardinfo[1].trim(),
              deviceid: parseInt(devinfo[0].trim()),
              device: devinfo[1].trim(),
            })
          }
        }
      }
    }

    return res
  }
}
