import { PipewireDumpParser } from "./pipewiredump"
import { PipeWireEqualizer } from "./pipewireeq"
import { PipewireReverbController } from "./pipewirereverb"
import { PipeWireRouter } from "./pipewirerouter"
import { PipeWireVolumeController } from "./pipewirevolumecontroller"
import { EqualizerPresetManager } from "./presetmanager"

import {
  ApplicationStreamMap,
  AudioSink,
  AudioStream,
  BandName,
  EqualizerPreset,
  PipewireDump,
  PipewireObject,
  PresetFileInfo,
  VolumeStatus,
} from "./types"

export {
  type ApplicationStreamMap,
  type AudioSink,
  type AudioStream,
  type BandName,
  type EqualizerPreset,
  type PipewireDump,
  type PipewireObject,
  type PresetFileInfo,
  type VolumeStatus,
} from "./types"

export class PipeWire {
  private readonly router: PipeWireRouter
  private readonly volumeController: PipeWireVolumeController
  private readonly eq: PipeWireEqualizer
  private readonly reverbController: PipewireReverbController
  private readonly presetManager: EqualizerPresetManager

  constructor() {
    this.router = new PipeWireRouter()
    this.volumeController = new PipeWireVolumeController()
    this.eq = new PipeWireEqualizer()
    this.reverbController = new PipewireReverbController()
    this.presetManager = new EqualizerPresetManager()
  }

  public async listSinks(): Promise<AudioSink[]> {
    return this.router.listSinks()
  }

  public async listActiveStreams(): Promise<AudioStream[]> {
    return this.router.listActiveStreams()
  }

  public async listActiveStreamsByApplication(): Promise<ApplicationStreamMap> {
    return this.router.listActiveStreamsByApplication()
  }

  public async redirectStream(streamId: number, targetSinkName: string): Promise<void> {
    return this.router.redirectStream(streamId, targetSinkName)
  }

  public async redirectApplicationToDefaultSink(streamId: number): Promise<void> {
    return this.router.redirectApplicationToDefaultSink(streamId)
  }

  public async setDefaultSink(targetSinkId: number): Promise<void> {
    return this.router.setDefaultSink(targetSinkId)
  }

  public async getVolumeStatus(): Promise<VolumeStatus> {
    return this.volumeController.getVolumeStatus()
  }

  public async getVolume(): Promise<number> {
    return (await this.volumeController.getVolumeStatus()).volume
  }

  public async setVolume(percentage: number): Promise<void> {
    return this.volumeController.setVolume(percentage)
  }

  public async toggleMute(): Promise<void> {
    return this.volumeController.toggleMute()
  }

  public async mute(): Promise<void> {
    return this.volumeController.mute()
  }

  public async unmute(): Promise<void> {
    return this.volumeController.unmute()
  }

  public applyEqPreset(preset: EqualizerPreset) {
    return this.eq.applyPreset(preset)
  }

  public setProperty(band: BandName, gain: any): void {
    return this.eq.setProperty(band, gain)
  }

  public getProperty(band: BandName): any {
    return this.eq.getGain(band)
  }

  public getCurrentEq(): Partial<Record<BandName, any>> {
    return this.eq.getCurrentSettings()
  }

  public setCurrentEq(settings: any): Partial<Record<BandName, any>> {
    return this.eq.setCurrentSettings(settings)
  }

  public resetEq(gain: number) {
    this.eq.resetSettings(gain)
  }

  public async getSystemDump(): Promise<PipewireDump> {
    return PipewireDumpParser.executeAndParse()
  }

  public async getAllPipewireObjects(): Promise<PipewireObject[]> {
    const dump = await this.getSystemDump()
    return Object.values(dump).flat() as PipewireObject[]
  }

  public async setReverbGain(gain: number): Promise<void> {
    return this.reverbController.changeGain(gain)
  }

  public async setReverbDelay(delay: number): Promise<void> {
    return this.reverbController.changeConvolverDelay(delay)
  }

  public async loadReverbIR(filename: string): Promise<void> {
    return this.reverbController.changeIR(filename)
  }

  public async disableReverb(): Promise<void> {
    return this.reverbController.disableFilter(filename)
  }

  public async enableReverb(irFilename: string): Promise<void> {
    return this.reverbController.enableFilter(irFilename)
  }

  public async listEqPresets(): Promise<PresetFileInfo[]> {
    return this.presetManager.generatePresetList()
  }

  public async readEqPresetFile(filename: string): Promise<EqualizerPreset> {
    return this.presetManager.readPresetFile(filename)
  }

  public async writeEqPresetFile(filename: string, preset: EqualizerPreset): Promise<void> {
    return this.presetManager.writePresetFile(filename, preset)
  }

  public getConvolverPresets() {
    return this.reverbController.getConvolverPresets()
  }
}
