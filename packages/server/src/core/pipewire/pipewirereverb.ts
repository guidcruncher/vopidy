import { logger } from "@/core/logger"
import { exec, execSync } from "child_process"
import * as fs from "fs"
import { promisify } from "util"
import { SpaControl } from "./types"

const execPromise = promisify(exec)

const FILTER_CHAIN_NODE_DESCRIPTION = "10-Band EQ Sink"
const CONVOLVER_NODE_NAME = "convolver"

interface PipeWireObject {
  id: number
  type: string
  info: {
    props: {
      "node.description"?: string
      "media.name"?: string
    }
  }
}

export class PipewireReverbController {
  private nodeName: string = "convolver"
  private nodeId: number | null
  private controlParamId: number = 16 // SPA_PARAM_Route is 16

  // Indices for the Convolver built-in filter controls
  private static readonly GAIN_INDEX = 0
  private static readonly DELAY_INDEX = 1

  constructor() {
//    this.nodeId = this.findConvolverNodeId()
  }

  private findConvolverNodeId(): number | null {
    logger.log(`Searching for PipeWire node with name: "${this.nodeName}"...`)
    let stdout: string
    try {
      // Execute the 'pw-dump' command and capture its JSON output
      stdout = execSync("pw-dump").toString()
    } catch (error) {
      logger.error("Error executing 'pw-dump'. Is PipeWire running?")
      logger.error(error)
      return null
    }

    let pwObjects: PipeWireObject[]
    try {
      // Parse the massive JSON output array
      pwObjects = JSON.parse(stdout)
    } catch (error) {
      logger.error("Error parsing JSON output from 'pw-dump'. The output may be corrupted.")
      logger.error(error)
      return null
    }

    // Iterate through all objects to find the one matching the node name
    for (const obj of pwObjects) {
      // 1. Check if it is a Node interface object
      if (obj.type === "PipeWire:Interface:Node" && obj.info && obj.info.props) {
        const props = obj.info.props

        // 2. Check if the description or media name matches our target name
        if (props["node.description"] === this.nodeName || props["media.name"] === this.nodeName) {
          logger.log(`Found node ID: ${obj.id}.`)
          return obj.id
        }
      }
    }

    logger.log(`Node with name "${this.nodeName}" not found. Check the configuration file.`)
    return null
  }

  private formatControl(index: number, value: number): string {
    const controlObj: SpaControl = {
      index: index,
      id: index, // id often matches index for simple controls
      type: "float",
      value: value,
    }
    // Convert to a single-line string with no spaces for safe shell execution (best practice)
    return `'${JSON.stringify(controlObj).replace(/"/g, "")}'`
  }

  public async changeGain(gain: number): Promise<void> {
    if (this.nodeId === null) {
      return
    }

    const spaControlString = this.formatControl(PipewireReverbController.GAIN_INDEX, gain)

    // Command format: pw-cli s <Node ID> <Param ID for Control> <SPA JSON>
    await execPromise(`pw-cli s ${this.nodeId} ${this.controlParamId} ${spaControlString}`)
  }

  public async changeConvolverDelay(delay: number): Promise<void> {
    if (this.nodeId === null) {
      return
    }

    const spaControlString = this.formatControl(PipewireReverbController.DELAY_INDEX, delay)
    await execPromise(`pw-cli s ${this.nodeId} ${this.controlParamId} ${spaControlString}`)
  }

  public async changeIR(filename: string, gain: number, delay: number): Promise<void> {
    logger.log(`Attempting to change convolver IR file to ${filename}...`)
    try {
      process.env.IR_RESPONSE_FILLENAME = `${filename}`
      const stdOut = execSync(`/usr/local/bin/reloadpipewire.sh "${filename}" ${gain} ${delay}`, {
        env: process.env,
      })
      logger.log(`Successfully set convolver IR file to ${filename}.`)
    } catch (err) {
      logger.error("Error changing IR Response file", err)
      throw err
    }
  }

  public async disableFilter(): Promise<void> {
    const filepath = `bypass.wav`
    await this.changeIR(filepath, 1, 0)
  }
  public async enableFilter(filename: string): Promise<void> {
    const filepath = `${filename}`
    await this.changeIR(filepath, 0.95, 0)
  }

  public getConvolverPresets() {
    const filepath = `${process.env.IR_RESPONSE_BASE}/00-index.json`
    const json = fs.readFileSync(filepath, "utf8")
    return JSON.parse(json)
  }
}
