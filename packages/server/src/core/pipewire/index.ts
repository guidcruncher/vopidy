import { PipewireDumpParser } from "./pipewiredump"
import { PipeWireRouter } from "./pipewirerouter"
import { PipeWireVolumeController } from "./pipewirevolumecontroller"
import {
  ApplicationStreamMap,
  AudioSink,
  AudioStream,
  PipewireDump,
  PipewireObject,
  VolumeStatus,
} from "./types"

export class PipeWireSystemFacade {
  private router: PipeWireRouter
  private volumeController: PipeWireVolumeController

  constructor() {
    this.router = new PipeWireRouter()
    this.volumeController = new PipeWireVolumeController()
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
}
