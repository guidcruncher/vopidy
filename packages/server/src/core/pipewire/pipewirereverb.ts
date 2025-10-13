import { logger } from "@/core/logger"
import { exec, ExecException } from "child_process"
import { promisify } from "util"
import { executeCommandSync } from "./utils"

const execPromise = promisify(exec)

const FILTER_CHAIN_NODE_DESCRIPTION = "10-Band EQ Sink"
const CONVOLVER_NODE_NAME = "convolver"

export class PipewireReverbController {
  private nodeId: string = ""

  constructor() {
    try {
      this.nodeId = this.findNodeId(FILTER_CHAIN_NODE_DESCRIPTION)
    } catch (e) {
      logger.error(
        "ReverbController could not initialize. Convolver filter chain may not be running.",
      )
      this.nodeId = ""
    }
  }

  private async runPwCliMetadata(command: string): Promise<string> {
    const cliCommand = `pw-cli metadata ${command}`
    try {
      const { stdout, stderr } = await execPromise(cliCommand)
      if (stderr) {
        logger.warn(`pw-cli command produced stderr: ${cliCommand}\nStderr: ${stderr.trim()}`)
      }
      return stdout.trim()
    } catch (error) {
      const err = error as ExecException
      logger.error(`Error executing: ${cliCommand}\n`, err)
      throw new Error(`PipeWire CLI command failed: ${err.message}`)
    }
  }

  public findNodeId(description: string): string {
    logger.log(`Searching for node with description: "${description}"...`)

    const command = `pw-dump | jq -r '.[] | select(.info.props."node.description" == "${description}") | .id'`
    const dump = executeCommandSync(command)

    const nodeId = dump.toString().trim().replace(/"/g, "")

    if (!nodeId || isNaN(parseInt(nodeId, 10))) {
      logger.error(
        `PipeWire Node ID not found for description: ${description}. Is the filter chain running?`,
      )
      throw new Error(
        `PipeWire Node ID not found for description: ${description}. Is the filter chain running?`,
      )
    }

    logger.log(`Found Node ID: ${nodeId}`)
    return nodeId
  }

  private async setConvolverControlProperty(
    property: "gain" | "delay" | "filename",
    value: number | string,
  ): Promise<void> {
    if (!this.nodeId) {
      throw new Error("PipeWire Node ID is not initialized. Cannot set convolver property.")
    }

    const formattedValue = typeof value === "string" ? `'${value}'` : value
    const command = `set ${this.nodeId} filter.config '{ "convolver": { "control": { "${property}": ${formattedValue} } } }'`

    try {
      await this.runPwCliMetadata(command)
    } catch (e) {
      logger.warn(
        "Direct metadata control failed. This feature might not be fully exposed for this filter property in your PipeWire version.",
        e,
      )
      throw e
    }
  }

  public async changeGain(newGain: number): Promise<void> {
    logger.log(`Attempting to change convolver gain to ${newGain}...`)
    await this.setConvolverControlProperty("gain", newGain)
    logger.log(`Successfully set convolver gain to ${newGain}.`)
  }

  public async changeConvolverDelay(newDelay: number): Promise<void> {
    logger.log(`Attempting to change convolver delay to ${newDelay}...`)
    await this.setConvolverControlProperty("delay", newDelay)
    logger.log(`Successfully set convolver delay to ${newDelay}.`)
  }

  public async changeIR(filename: string): Promise<void> {
    logger.log(`Attempting to change convolver IR file to ${filename}...`)
    await this.setConvolverControlProperty("filename", filename)
    logger.log(`Successfully set convolver IR file to ${filename}.`)
  }

  public async disableFilter(): Promise<void> {
    const filepath = `${process.env.IR_RESPONSE_BASE}/bypass.wav`
    await this.changeGain(1)
    await this.changeIR(filepath)
  }

  public async enableFilter(filename: string): Promise<void> {
    const filepath = `${process.env.IR_RESPONSE_BASE}/${filename}`
    await this.changeGain(1)
    await this.changeIR(filepath)
  }

  public getConvolverPresets() {
    const filepath = `${process.env.IR_RESPONSE_BASE}/00-index.json`
    const json = fs.readFileSync(filepath, "utf8")
    return JSON.parse(json)
  }
}
