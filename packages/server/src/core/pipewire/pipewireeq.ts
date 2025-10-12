import { logger } from "@/core/logger"
import { execSync } from "child_process"
import { BandName, DISPLAY_BANDS, EQ_BANDS, EqualizerPreset } from "./types"

const masterProps = ["Mute", "Input:", "Balance", "Output"]

const frequencytoband = (freq: number) => {
  if (freq < 1000) {
    return `${freq}Hz`
  }
  return `${freq / 1000}kHz`
}

export class PipeWireEqualizer {
  private nodeId: string | null = null
  private readonly sinkName = "eq-sink"

  constructor() {
    if (this.eqEnabled()) {
      this.nodeId = this.getNodeIdByName(this.sinkName)
      if (!this.nodeId) {
        logger.error(
          `❌ ERROR: PipeWire node "${this.sinkName}" not found. Is the filter-chain loaded?`,
        )
        process.exit(1)
      }
      logger.log(`✅ Found PipeWire Node ID: ${this.nodeId}`)
    }
  }

  public applyPreset(preset: EqualizerPreset) {
    for (const band of preset.bands) {
      let eqband: BandName | undefined = undefined
      try {
        eqband = frequencytoband(band.frequency_hz) as BandName
      } catch (err) {
        logger.error("Error determining EQ band from frequency:", err)
        eqband = undefined
      }
      if (eqband && EQ_BANDS[eqband]) {
        this.setProperty(eqband, band.gain_db)
      } else {
        logger.warn(`Skipping band with unknown frequency: ${band.frequency_hz}Hz`)
      }
    }
  }

  public getEqBandByValue(index: number): BandName {
    const value = index < 1000 ? `${index}Hz` : `${index / 1000}kHz`
    return EQ_BANDS[value as keyof typeof EQ_BANDS] as BandName
  }

  private eqEnabled() {
    return true
  }

  private executeCommand(command: string): string {
    try {
      logger.trace(" eqcommand =>   ", command)
      return execSync(command, { encoding: "utf-8", stdio: "pipe" }).trim()
    } catch (error) {
      logger.error(`\n🚨 Failed to execute command: ${command}`, error)
      throw new Error(`Command failed.`)
    }
  }

  private getNodeIdByName(name: string): string | null {
    if (!this.eqEnabled()) {
      return null
    }

    const jsonOutput = this.executeCommand("pw-dump -N")
    try {
      const graph = JSON.parse(jsonOutput)
      const targetNode = graph.find((obj: any) => {
        return obj.type === "PipeWire:Interface:Node" && obj.info.props?.["media.name"] === name
      })
      return targetNode ? String(targetNode.id) : null
    } catch (e) {
      logger.error("🚨 Failed to parse pw-dump JSON output.", e)
      return null
    }
  }

  public getControlValue<T>(controlName: string): T {
    if (!this.eqEnabled() || !this.nodeId) {
      return null as unknown as T
    }
    try {
      const stdout = execSync(`pw-dump ${this.nodeId}`)
      const dump = JSON.parse(stdout.toString())

      if (!dump[0] || !dump[0].info || !dump[0].info.params || !dump[0].info.params.Props) {
        logger.error(`Error: Dump structure invalid for Node ${this.nodeId}.`)
        return null as unknown as T
      }

      const propsParam = dump[0].info.params.Props.find(
        (p: any) => p.params && p.params.includes(controlName),
      )

      if (!propsParam) {
        logger.error(
          `Error: Could not find control '${controlName}' in 'Props' parameters for Node ${this.nodeId}.`,
        )
        return null as unknown as T
      }

      const paramsArray = propsParam.params
      const index = paramsArray.indexOf(controlName)

      const parameterValue = paramsArray[index + 1]
      return parameterValue as unknown as T
    } catch (error) {
      logger.error(`Failed to execute pw-dump or parse output for Node ${this.nodeId}:`, error)
      return null as unknown as T
    }
  }

  public getGain(band: BandName): number {
    if (!this.eqEnabled()) {
      return 0
    }
    const controlName = EQ_BANDS[band]
    const value = this.getControlValue<number>(controlName)
    return value !== null && !isNaN(Number(value)) ? Number(value) : 0
  }

  public setProperty(band: BandName, prop: number | boolean) {
    if (!this.nodeId) return

    const controlName = EQ_BANDS[band]
    const value =
      typeof prop === "number" ? parseFloat(prop.toString()).toFixed(2) : prop.toString()

    let command = `pw-cli set-param ${this.nodeId} Props '{params = ["${controlName}" ${value}]}'`

    if (masterProps.includes(band as string)) {
      command = `pw-cli set-param ${this.nodeId} Node:master_control ${controlName} ${value}`
    }

    logger.log(`   Setting ${band} to ${value} B...`)
    this.executeCommand(command)
  }

  public getCurrentSettings(): any {
    const settings: Partial<Record<BandName, number | boolean>> = {}
    const bands: BandName[] = Object.keys(EQ_BANDS) as BandName[]
    const arr = []
    for (const band of bands) {
      settings[band] = this.getGain(band)
      arr.push({ name: band, value: settings[band], display: DISPLAY_BANDS[band] ? true : false })
    }

    return arr
  }

  public setCurrentSettings(settings: any): Partial<Record<BandName, number | boolean>> {
    const bands: BandName[] = Object.keys(EQ_BANDS) as BandName[]

    for (const item of bands) {
      if (settings[item]) {
        this.setProperty(item, settings[item])
      }
    }
    return this.getCurrentSettings()
  }

  public resetSettings(value: number) {
    if (!this.eqEnabled()) {
      return this.getCurrentSettings()
    }
    const bands: BandName[] = Object.keys(EQ_BANDS) as BandName[]

    const resetValue = value ?? 0
    for (const band of bands) {
      this.setProperty(band, resetValue)
    }
    return this.getCurrentSettings()
  }
}
