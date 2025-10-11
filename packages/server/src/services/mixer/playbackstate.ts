export class PlaybackState {
  uri: string = ""
  source: string = ""
  volume: number = 100
  lastvolume: number = 100
  muted: boolean = false
  mixer: any = undefined
  librespot: string = ""
}
