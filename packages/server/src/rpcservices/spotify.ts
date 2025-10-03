import { CacheManager } from "@/core/cachemanager"
import { RpcService, ServiceModule } from "@/core/jsonrpc/types"
import { shimNonPaged } from "@/core/paging"
import { SpotifyCatalog } from "@/services/spotify/spotifycatalog"
import { SpotifyLibrary } from "@/services/spotify/spotifylibrary"
import { SpotifyUserLibrary } from "@/services/spotify/spotifyuserlibrary"

class SpotifyService implements RpcService {
  public async album(id: string) {
    const spotifyClient = new SpotifyCatalog()
    let res = await spotifyClient.getAlbum(id)
    return shimNonPaged(res)
  }

  public async albums() {
    const spotifyClient = new SpotifyLibrary()
    return await spotifyClient.getAlbums()
  }

  public async artist_albums(id: string) {
    const spotifyClient = new SpotifyCatalog()
    return await spotifyClient.getArtistAlbums(id)
  }

  public async artist_tracks(id: string) {
    const spotifyClient = new SpotifyCatalog()
    return await spotifyClient.getArtistsTopTracks(id)
  }

  public async create_playlist(name: string, uris: string[]) {
    const spotifyClient = new SpotifyCatalog()
    let res = await spotifyClient.createPlaylist(name, uris)
    await CacheManager.flush()
    return res
  }

  public async artist(id: string) {
    const spotifyClient = new SpotifyCatalog()
    const res = await spotifyClient.getArtist(id)
    return shimNonPaged(res)
  }

  public async artists() {
    const spotifyClient = new SpotifyLibrary()
    return await spotifyClient.getArtists()
  }

  public async describe(id: string) {
    const spotifyClient = new SpotifyCatalog()
    return await spotifyClient.describe(id)
  }

  public async doesfollow(itemtype: string, id: string) {
    const spotifyClient = new SpotifyUserLibrary()
    let res = await spotifyClient.doesFollow(itemtype, id)
    return { id: id, following: res??false }
  }

  public async follow(itemtype: string, id: string) {
    const spotifyClient = new SpotifyUserLibrary()
    let res = await spotifyClient.follow(itemtype, id)
    return res
  }

  public async library_add(id: string) {
    const spotifyClient = new SpotifyUserLibrary()
    let res = await spotifyClient.saveToLibrary(id)
    return res
  }

  public async library_contains(id: string) {
    const spotifyClient = new SpotifyUserLibrary()
    let res = await spotifyClient.inLibrary(id)
    return { id: id, exists: res }
  }

  public async library_remove(id: string) {
    const spotifyClient = new SpotifyUserLibrary()
    let res = await spotifyClient.removeFromLibrary(id)
    return res
  }

  public async newreleases() {
    const spotifyClient = new SpotifyCatalog()
    return await spotifyClient.getNewAlbums()
  }

  public async playlist(id: string, offset: number, limit: number) {
    const spotifyClient = new SpotifyLibrary()
    return await spotifyClient.getPlaylist(id, offset, limit)
  }

  public async playlists() {
    const spotifyClient = new SpotifyLibrary()
    return await spotifyClient.getPlaylists()
  }

  public async queue() {
    const spotifyClient = new SpotifyCatalog()
    return await spotifyClient.getQueue()
  }

  public async show(id: string, offset: number, limit: number) {
    const spotifyClient = new SpotifyCatalog()
    const res = await spotifyClient.getShow(id, offset, limit)
    return res
  }

  public async shows() {
    const spotifyClient = new SpotifyLibrary()
    return await spotifyClient.getShows()
  }

  public async tracks() {
    const spotifyClient = new SpotifyLibrary()
    return await spotifyClient.getTracks()
  }

  public async unfollow(itemtype: string, id: string) {
    const spotifyClient = new SpotifyUserLibrary()
    let res = await spotifyClient.unfollow(itemtype, id)
    return res
  }
}

export const namespace = "spotify"
export const service = new SpotifyService()

const module: ServiceModule = { namespace, service }
export default module
