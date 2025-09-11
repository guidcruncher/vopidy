import { percentToVolume, PulseAudio, volumeToPercent } from "pulseaudio.js"

export class Pulseaudio {
  playbackSink = "alsa-sink"

  public async getSinkInfo(sink: string = "") {
    const pa = await this.getServer()
    const info = await pa.getSinkInfo(sink == "" ? this.playbackSink : sink)
    await pa.disconnect()
    return info
  }

  private async getServer() {
    const pa = new PulseAudio(undefined, undefined, "/tmp/pulse/native" as any)
    await pa.connect()
    return pa
  }

  public async getVolume() {
    const pa = await this.getServer()
    const id = await pa.lookupSink(this.playbackSink)
    const sink = await pa.getSinkInfo(id)
    await pa.disconnect()

    let volume = volumeToPercent(sink.volume.current[0])
    return volume
  }

  public async getVolumeLinear() {
    const pa = await this.getServer()
    const id = await pa.lookupSink(this.playbackSink)
    const sink = await pa.getSinkInfo(id)
    await pa.disconnect()
    return sink.volume.current[0]
  }

  public async setVolume(levelPercent: number) {
    const pa = await this.getServer()
    const res = await pa.setSinkVolume(
      [percentToVolume(levelPercent), percentToVolume(levelPercent)],
      this.playbackSink,
    )
    await pa.disconnect()
    return res
  }

  public async mute() {
    const pa = await this.getServer()
    const res = await pa.setSinkMute(true, this.playbackSink)
    await pa.disconnect()
    return res
  }

  public async unmute() {
    const pa = await this.getServer()
    const res = await pa.setSinkMute(false, this.playbackSink)
    await pa.disconnect()
    return res
  }
}
