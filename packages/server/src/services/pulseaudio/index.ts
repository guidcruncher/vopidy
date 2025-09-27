import { percentToVolume, PulseAudio, volumeToPercent } from "pulseaudio.js"
import { PulseAudioClient } from "./pulseaudioclient"

export class Pulseaudio {
  private client: PulseAudioClient
  private playbackSink = "snapcast-sink"

  constructor(client: PulseAudioClient = new PulseAudioClient()) {
    this.client = client
  }

  private async execute(callback: (pa: PulseAudio) => Promise<any>): Promise<any> {
    const pa = await this.client.connect()
    try {
      return await callback(pa)
    } finally {
      // Ensure disconnection happens even if callback throws an error
      await this.client.disconnect(pa)
    }
  }

  // --- Public Operations ---

  public async getSinkInfo(sink: string = "") {
    const targetSink = sink === "" ? this.playbackSink : sink
    return this.execute(async (pa) => {
      return pa.getSinkInfo(targetSink)
    })
  }

  public async getVolume(): Promise<number> {
    return this.execute(async (pa) => {
      const id = await pa.lookupSink(this.playbackSink)
      const sink = await pa.getSinkInfo(id)
      return volumeToPercent(sink.volume.current[0])
    })
  }

  public async getVolumeLinear(): Promise<number> {
    return this.execute(async (pa) => {
      const id = await pa.lookupSink(this.playbackSink)
      const sink = await pa.getSinkInfo(id)
      return sink.volume.current[0]
    })
  }

  public async setVolume(levelPercent: number) {
    return this.execute(async (pa) => {
      return pa.setSinkVolume(
        [percentToVolume(levelPercent), percentToVolume(levelPercent)],
        this.playbackSink,
      )
    })
  }

  public async mute() {
    return this.execute(async (pa) => {
      return pa.setSinkMute(true, this.playbackSink)
    })
  }

  public async unmute() {
    return this.execute(async (pa) => {
      return pa.setSinkMute(false, this.playbackSink)
    })
  }
}
