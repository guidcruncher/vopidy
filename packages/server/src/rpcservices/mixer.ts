import { RpcService, ServiceModule } from "@/core/jsonrpc/types"
import { BandName, PipeWire } from "@/core/pipewire/"
import { EqualizerPresetManager } from "@/core/pipewire/presetmanager"
import { Mixer } from "@/services/mixer/"

class MixerService implements RpcService {
  public async convolver_disable() {
    const equal = new PipeWire()
    return equal.disableReverb()
  }

  public async convolver_apply(filename: string) {
    const equal = new PipeWire()
    return equal.enableReverb(filename)
  }

  public async convolver_applyprops(gain: number, delay: number) {
    const equal = new PipeWire()
    await equal.setReverbGain(gain)
    return await equal.setReverbDelay(delay)
  }

  public convolver_list() {
    const equal = new PipeWire()
    return equal.getConvolverPresets()
  }

  public async equaliser_get() {
    const equal = new PipeWire()
    return equal.getCurrentEq()
  }

  public async equaliser_reset(value: any) {
    const equal = new PipeWire()
    return equal.resetEq(value ? (value.gain ?? value) : 0)
  }

  public async equaliser_set(value: any) {
    const equal = new PipeWire()
    return equal.setProperty(value.name, value.value)
  }

  public async equaliser_listpresets() {
    const equal = new EqualizerPresetManager()
    return await equal.generatePresetList()
  }

  public async equaliser_setpreset(json: string) {
    const equal = new PipeWire()
    const preset = JSON.parse(JSON.parse(json))
    return equal.applyEqPreset(preset)
  }

  public async equaliser_loadpreset(filename: string) {
    const equal = new PipeWire()
    const presetmgr = new EqualizerPresetManager()
    const preset = await presetmgr.readPresetFile(presetmgr.fullPath(filename))
    return equal.applyEqPreset(preset)
  }

  public async equaliser_setband(band: BandName, value: number) {
    const equal = new PipeWire()
    return equal.setProperty(band, value)
  }

  public async mute() {
    return Mixer.mute()
  }

  public async output() {
    return Mixer.activeOutputDevice()
  }

  public async setvolume(level: number) {
    return await Mixer.setVolume(level)
  }

  public async unmute() {
    return Mixer.unmute()
  }
}

export const namespace = "mixer"
export const service = new MixerService()

const module: ServiceModule = { namespace, service }
export default module
