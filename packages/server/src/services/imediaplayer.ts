export interface IMediaPlayer {
  play(id: string)
  previous()
  next()
  stop()
  pause()
  resume()
  getStatus()
  seek(position: number)
}
