import { logger } from "@/core/logger"
import { exec } from "child_process"
import { promisify } from "util"
import { PipewireDump, PipewireObject } from "./types"

const execPromise = promisify(exec)

export class PipewireDumpParser {
  private rawJsonString: string

  constructor(rawJsonString: string) {
    this.rawJsonString = rawJsonString
  }

  public static async executeAndParse(): Promise<PipewireDump> {
    const command = "pw-dump -N"

    try {
      const { stdout, stderr } = await execPromise(command, { maxBuffer: 1024 * 5000 })

      if (stderr) {
        logger.warn(`pw-dump produced warnings/stderr: ${stderr.trim()}`)
      }

      const parser = new PipewireDumpParser(stdout)

      return parser.parse()
    } catch (error: any) {
      const errorMessage = `Failed to execute 'pw-dump -j'. Error: ${error.message}`
      logger.error(errorMessage)
      throw new Error(errorMessage)
    }
  }

  public parse(): PipewireDump {
    let dumpArray: PipewireObject[]

    try {
      dumpArray = JSON.parse(this.rawJsonString) as PipewireObject[]
    } catch (e) {
      logger.error("Failed to parse pw-dump JSON string:", e)
      throw new Error("Invalid JSON format in pw-dump output.")
    }

    const structuredDump: PipewireDump = {
      metadata: [],
      core: [],
      modules: [],
      factories: [],
      devices: [],
      nodes: [],
      ports: [],
      clients: [],
      links: [],
    }

    for (const obj of dumpArray) {
      if (typeof obj.id !== "number" || typeof obj.type !== "string") {
        logger.warn(`Skipping object due to missing 'id' or 'type':`, obj)
        continue
      }

      const typeParts = obj.type.split(":")
      const categoryKey = typeParts[typeParts.length - 1].toLowerCase()

      const categoryArray = structuredDump[categoryKey] as PipewireObject[] | undefined

      if (categoryArray) {
        categoryArray.push(obj)
      } else {
        if (!structuredDump[categoryKey]) {
          structuredDump[categoryKey] = []
        }
        structuredDump[categoryKey].push(obj)
      }
    }

    return structuredDump
  }
}
