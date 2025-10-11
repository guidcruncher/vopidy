export interface AudioSink {
  id: number
  name: string
  description: string
  isDefault: boolean
}

export interface AudioStream {
  id: number
  sinkId: number
  applicationName: string
}

export type ApplicationStreamMap = {
  [applicationName: string]: AudioStream[]
}

export interface VolumeStatus {
  volume: number
  isMuted: boolean
}

export interface PipewireObject {
  id: number
  type: string
  [key: string]: any
}

export interface PipewireDump {
  metadata: PipewireObject[]
  core: PipewireObject[]
  modules: PipewireObject[]
  factories: PipewireObject[]
  devices: PipewireObject[]
  nodes: PipewireObject[]
  ports: PipewireObject[]
  clients: PipewireObject[]
  links: PipewireObject[]
  [key: string]: PipewireObject[]
}

export class Eq10Parameters {
  /**
   * The stereo balance control. 0.0 is center.
   */
  balance: number

  /**
   * Gain in dB for the 31 Hz band.
   */
  band_0_gain: number

  /**
   * Gain in dB for the 63 Hz band.
   */
  band_1_gain: number

  /**
   * Gain in dB for the 125 Hz band.
   */
  band_2_gain: number

  /**
   * Gain in dB for the 250 Hz band.
   */
  band_3_gain: number

  /**
   * Gain in dB for the 500 Hz band.
   */
  band_4_gain: number

  /**
   * Gain in dB for the 1000 Hz band.
   */
  band_5_gain: number

  /**
   * Gain in dB for the 2000 Hz band.
   */
  band_6_gain: number

  /**
   * Gain in dB for the 4000 Hz band.
   */
  band_7_gain: number

  /**
   * Gain in dB for the 8000 Hz band.
   */
  band_8_gain: number

  /**
   * Gain in dB for the 16000 Hz band.
   */
  band_9_gain: number

  /**
   * Overall pre-gain for the filter (usually negative to prevent clipping).
   */
  input_gain: number

  /**
   * Mute state of the filter.
   */
  mute: boolean

  /**
   * Output gain for the filter.
   */
  output_gain: number

  /**
   * Filter mode (typically 0 for standard EQ).
   */
  mode: number
}

export interface EasyEffectsFilter {
  name: "eq10" | string

  params: Eq10Parameters | any // Use 'any' if the filter name is not 'eq10'
}

// --------------------------------------------------

export interface EasyEffectsMetadata {
  name: string

  description: string
}

export interface EasyEffectsPreset {
  metadata: EasyEffectsMetadata
  input: EasyEffectsFilter[]
  output: EasyEffectsFilter[]
}
