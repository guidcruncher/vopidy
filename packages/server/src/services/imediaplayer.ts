export interface IMediaPlayer {
  playTrackFile(filename: string)
  playTrackUrl(url: string)
  previous()
  next()
  stop()
  pause()
  resume()
  getStatus()
  seek(position: number)
}
