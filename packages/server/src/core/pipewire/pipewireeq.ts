import { logger } from "@/core/logger"
import { execSync } from "child_process"
import { Band, EqualizerPreset } from "./presetmanager"
const masterProps = ["Mute", "Input:", "Balance", "Output"]

const EQ_BANDS = {
  //  Mute: "master_mute:Mute",
  //  Input: "input_gain:Volume",
  //  Balance: "balance_control:balance",
  "31Hz": "eq_band_1:Gain",
  "63Hz": "eq_band_2:Gain",
  "125Hz": "eq_band_3:Gain",
  "250Hz": "eq_band_4:Gain",
  "500Hz": "eq_band_5:Gain",
  "1kHz": "eq_band_6:Gain",
  "2kHz": "eq_band_7:Gain",
  "4kHz": "eq_band_8:Gain",
  "8kHz": "eq_band_9:Gain",
  "16kHz": "eq_band_10:Gain",
  //  Output: "output_gain:Volume",
} as const

const DISPLAY_BANDS = {
  "31Hz": "eq_band_1:Gain",
  "63Hz": "eq_band_2:Gain",
  "125Hz": "eq_band_3:Gain",
  "250Hz": "eq_band_4:Gain",
  "500Hz": "eq_band_5:Gain",
  "1kHz": "eq_band_6:Gain",
  "2kHz": "eq_band_7:Gain",
  "4kHz": "eq_band_8:Gain",
  "8kHz": "eq_band_9:Gain",
  "16kHz": "eq_band_10:Gain",
} as const

const frequencytoband = (freq: number) => {
  if (freq < 1000) {
    return `${freq}Hz`
  }
  return `${freq / 1000}kHz`
}

export type BandName = keyof typeof EQ_BANDS

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
    for (let i = 0; i < preset.bands.length; i++) {
      const band: Band = preset.bands[i]
      let eqband = undefined
      try {
        eqband = frequencytoband(band.frequency_hz) as BandName
      } catch (err) {
        logger.error(err)
        eqband = undefined
      }
      if (eqband) {
        const bandName = EQ_BANDS[eqband] as BandName
        this.setProperty(eqband, band.gain_db)
      }
    }
  }

  public getEqBandByValue(index: number): BandName {
    const value = index < 1000 ? `${index}Hz` : `${index / 1000}kHz`
    return EQ_BANDS[value]
  }

  private eqEnabled() {
    return true
  }

  private executeCommand(command: string): string {
    try {
      logger.trace(" eqcommand =>   ", command)
      return execSync(command, { encoding: "utf-8", stdio: "pipe" }).trim()
    } catch (error) {
      logger.error(`\n🚨 Failed to execute command: ${command}`)
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
    if (!this.eqEnabled()) {
      return null
    }
    try {
      const stdout = execSync(`pw-dump ${this.nodeId}`)
      const dump = JSON.parse(stdout.toString())
      const propsParam = dump[0].info.params.Props.find((p: any) => p.params.includes(controlName))
      if (!propsParam) {
        logger.error(`Error: Could not find 'Props' parameter for Node ${this.nodeId}.`)
        return null
      }

      const index = propsParam.params.indexOf(controlName)
      if (index < 0) {
        logger.error(`Error: Could not find dynamic 'params' array for Node ${this.nodeId}.`)
        return null
      }

      const parameterValue = propsParam.params[index + 1]
      return parameterValue as unknown as T
    } catch (error) {
      logger.error(`Failed to execute pw-dump or parse output for Node ${this.nodeId}:`, error)
      return null
    }
  }

  public getGain(band: BandName): number {
    if (!this.eqEnabled()) {
      return 0
    }
    const controlName = EQ_BANDS[band]
    return this.getControlValue<number>(controlName)
  }

  public setProperty(band: BandName, prop: number | boolean) {
    const controlName = EQ_BANDS[band]
    const value = parseFloat(prop.toString()).toFixed(2)

    let command = `pw-cli set-param ${this.nodeId} Props '{params = ["${controlName}" ${value}]}'`

    if (masterProps.includes(band)) {
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
      return 0
    }
    const bands: BandName[] = Object.keys(EQ_BANDS) as BandName[]
    console.log(value)
    for (const band of bands) {
      this.setProperty(band, value ?? 0)
    }
    return this.getCurrentSettings()
  }
}
