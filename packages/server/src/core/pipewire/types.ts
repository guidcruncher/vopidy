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
