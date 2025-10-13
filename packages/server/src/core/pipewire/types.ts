export interface SpaControl {
  index: number
  id: number
  type: "float"
  value: number
}

export interface Band {
  frequency_hz: number
  gain_db: number
  notes: string
}

export interface EqualizerPreset {
  equalizer_preset_name: string
  description: string
  bands: Band[]
}

export interface PresetFileInfo {
  fileName: string
  equalizerPresetName: string
  fullPath: string
}

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
  balance: number
  band_0_gain: number
  band_1_gain: number
  band_2_gain: number
  band_3_gain: number
  band_4_gain: number
  band_5_gain: number
  band_6_gain: number
  band_7_gain: number
  band_8_gain: number
  band_9_gain: number
  input_gain: number
  mute: boolean
  output_gain: number
  mode: number
}

export interface EasyEffectsFilter {
  name: "eq10" | string

  params: Eq10Parameters | any
}

export interface EasyEffectsMetadata {
  name: string
  description: string
}

export interface EasyEffectsPreset {
  metadata: EasyEffectsMetadata
  input: EasyEffectsFilter[]
  output: EasyEffectsFilter[]
}

export const EQ_BANDS = {
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

export const DISPLAY_BANDS = {
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

export type BandName = keyof typeof EQ_BANDS
