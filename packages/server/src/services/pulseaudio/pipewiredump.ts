import { exec } from "child_process"
import { promisify } from "util"

const execPromise = promisify(exec)

export interface PipewireDump {
  metadata: PipewireObject[]
  core: PipewireObject[]
  modules: PipewireObject[]
  factories: PipewireObject[]
  devices: PipewireObject[]
  nodes: PipewireObject[]
  ports: PipewireObject[]
  clients: PipewireObject[]
  links: PipewireObject[]
  // Fallback for any other object types
  [key: string]: PipewireObject[]
}

export interface PipewireObject {
  id: number
  type: string
  [key: string]: any
}

export class PipewireDumpParser {
  private rawJsonString: string

  constructor(rawJsonString: string) {
    this.rawJsonString = rawJsonString
  }

  public static async executeAndParse(): Promise<PipewireDump> {
    const command = "pw-dump -N"

    try {
      // Execute the command and capture stdout
      const { stdout, stderr } = await execPromise(command, { maxBuffer: 1024 * 5000 }) // Increase buffer for large dumps

      if (stderr) {
        console.warn(`pw-dump produced warnings/stderr: ${stderr.trim()}`)
      }

      // Create a new parser instance with the raw JSON string
      const parser = new PipewireDumpParser(stdout)

      // Parse the output
      return parser.parse()
    } catch (error: any) {
      // Throw an error if the command execution fails (e.g., pw-dump not found, or non-zero exit code)
      const errorMessage = `Failed to execute 'pw-dump -j'. Error: ${error.message}`
      console.error(errorMessage)
      throw new Error(errorMessage)
    }
  }

  public parse(): PipewireDump {
    let dumpArray: PipewireObject[]

    try {
      // The pw-dump output is an array of objects
      dumpArray = JSON.parse(this.rawJsonString) as PipewireObject[]
    } catch (e) {
      console.error("Failed to parse pw-dump JSON string:", e)
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
        console.warn(`Skipping object due to missing 'id' or 'type':`, obj)
        continue
      }

      // Get the category key (e.g., 'Node', 'Link', 'Client')
      const typeParts = obj.type.split(":")
      const categoryKey = typeParts[typeParts.length - 1].toLowerCase()

      // Find the corresponding array in the structuredDump object
      const categoryArray = structuredDump[categoryKey] as PipewireObject[] | undefined

      if (categoryArray) {
        categoryArray.push(obj)
      } else {
        // Handle new or fallback types dynamically
        if (!structuredDump[categoryKey]) {
          structuredDump[categoryKey] = []
        }
        structuredDump[categoryKey].push(obj)
      }
    }

    return structuredDump
  }
}
