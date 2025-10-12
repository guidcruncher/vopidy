import { logger } from "@/core/logger"
import { exec, execSync } from "child_process"
import { promisify } from "util"

const execPromise = promisify(exec)

const FILTER_CHAIN_NODE_DESCRIPTION = "10-Band EQ Sink"
const CONVOLVER_NODE_NAME = "convolver"

export class PipewireReverbController {
  private nodeId: string = ""

  constructor() {
    this.nodeId = this.findNodeId(FILTER_CHAIN_NODE_DESCRIPTION)
  }

  private executeCommandSync(command: string): string {
    try {
      logger.trace(" eqcommand =>   ", command)
      return execSync(command, { encoding: "utf-8", stdio: "pipe" }).trim()
    } catch (error) {
      logger.error(`\n🚨 Failed to execute command: ${command}`)
      throw new Error(`Command failed.`)
    }
  }

  private async runPwCli(command: string): Promise<string> {
    const cliCommand = `pw-cli ${command}`
    try {
      const { stdout } = await execPromise(cliCommand)
      return stdout.trim()
    } catch (error) {
      logger.error(`Error executing: ${cliCommand}\n`, error)
      throw new Error("PipeWire CLI command failed.")
    }
  }

  public findNodeId(description: string): string {
    logger.log(`Searching for node with description: "${description}"...`)

    // Use pw-dump to get a JSON dump and filter for the description
    const dump = this.executeCommandSync(
      `pw-dump | jq '.[] | select(.info.props."node.description" == "${description}") | .id'`,
    )
    const nodeId = dump.toString().trim().replace(/"/g, "")

    if (!nodeId) {
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

  public async changeGain(newGain: number): Promise<void> {
    logger.log(`Attempting to change convolver gain to ${newGain}...`)

    try {
      const command = `set ${this.nodeId} filter.config '{ "convolver": { "control": { "gain": ${newGain} } } }'`
      await this.runPwCli(`metadata ${command}`)
      logger.log(`Successfully set convolver gain to ${newGain}.`)
    } catch (e) {
      // Fallback or warning if the direct metadata approach fails
      logger.warn(
        "Direct metadata control failed. This feature might not be fully exposed for this filter property in your PipeWire version.",
      )
      throw e
    }
  }

  public async changeConvolverDelay(newDelay: number): Promise<void> {
    logger.log(`Attempting to change convolver delay to ${newDelay}...`)
    try {
      const command = `set ${this.nodeId} filter.config '{ "convolver": { "control": { "delay": ${newDelay} } } }'`
      await this.runPwCli(`metadata ${command}`)
      logger.log(`Successfully set convolver delay to ${newDelay}.`)
    } catch (e) {
      // Fallback or warning if the direct metadata approach fails
      logger.warn(
        "Direct metadata control failed. This feature might not be fully exposed for this filter property in your PipeWire version.",
      )
      throw e
    }
  }

  public async changeIR(filename: string): Promise<void> {
    logger.log(`Attempting to change convolver IR file to ${filename}...`)
    try {
      const command = `set ${this.nodeId} filter.config '{ "convolver": { "control": { "filename": '${filename}' } } }'`
      await this.runPwCli(`metadata ${command}`)
      logger.log(`Successfully set convolver IR file to ${filename}.`)
    } catch (e) {
      // Fallback or warning if the direct metadata approach fails
      logger.warn(
        "Direct metadata control failed. This feature might not be fully exposed for this filter property in your PipeWire version.",
      )
      throw e
    }
  }

  public async disableFilter(filename: string): Promise<void> {
    const filepath = `${process.env.IR_RESPONSE_BASE}/bypass.wav`
    await this.changeGain( 1)
    await this.changeIR(filepath)
  }

  public async enableFilter(filename: string): Promise<void> {
    const filepath = `${process.env.IR_RESPONSE_BASE}/${filename}`
    await this.changeGain( 1)
    await this.changeIR(filepath)
  }
}
