import { PipewireDumpParser } from "./pipewiredump"
import { BandName, PipeWireEqualizer } from "./pipewireeq"
import { PipeWireRouter } from "./pipewirerouter"
import { PipeWireVolumeController } from "./pipewirevolumecontroller"
import { type EqualizerPreset } from "./presetmanager"
import {
  ApplicationStreamMap,
  AudioSink,
  AudioStream,
  PipewireDump,
  PipewireObject,
  VolumeStatus,
} from "./types"

export { type BandName } from "./pipewireeq"
export { type EqualizerPreset } from "./presetmanager"

export class PipeWire {
  private router: PipeWireRouter
  private volumeController: PipeWireVolumeController
  private eq: PipeWireEqualizer

  constructor() {
    this.router = new PipeWireRouter()
    this.volumeController = new PipeWireVolumeController()
    this.eq = new PipeWireEqualizer()
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

  public applyEqPreset(preset: EqualizerPreset) {
    return this.eq.applyPreset(preset)
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

  public async getSystemDump(): Promise<PipewireDump> {
    return PipewireDumpParser.executeAndParse()
  }

  public async getAllPipewireObjects(): Promise<PipewireObject[]> {
    const dump = await this.getSystemDump()
    return Object.values(dump).flat() as PipewireObject[]
  }

  public setProperty(band: BandName, gain: any): void {
    return this.eq.setProperty(band, gain)
  }

  public getProperty(band: BandName): any {
    return this.eq.getControlValue<any>(band)
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
}
