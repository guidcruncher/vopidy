import { RpcService } from "@/core/jsonrpc/types"
import { Equaliser } from "@/services/alsa/equaliser"
import { Mixer } from "@/services/mixer/"

class MixerService implements RpcService {
  public async equaliser_get() {
    const equal = new Equaliser()
    return equal.getMixer()
  }

  public async equaliser_reset(value: number) {
    const equal = new Equaliser()
    return await equal.resetMixer(value)
  }

  public async equaliser_set(value: any) {
    const equal = new Equaliser()
    return await equal.updateMixer(value)
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
