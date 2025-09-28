import { RpcService, ServiceModule } from "@/core/jsonrpc/types"
import { shimNonPaged } from "@/core/paging"
import { JsonRpcMessage } from "@/rpc/jsonrpcmessage"
import { SpotifyCatalog } from "@/services/spotify/spotifycatalog"
import { SpotifyLibrary } from "@/services/spotify/spotifylibrary"
import { SpotifyUserLibrary } from "@/services/spotify/spotifyuserlibrary"

class SpotifyService implements RpcService {
  public async album(message: JsonRpcMessage) {
    const spotifyClient = new SpotifyCatalog()
    let res = await spotifyClient.getAlbum(message.params["id"])
    return shimNonPaged(res)
  }

  public async albums(message: JsonRpcMessage) {
    const spotifyClient = new SpotifyLibrary()
    return await spotifyClient.getAlbums()
  }

  public async artist_albums(message: JsonRpcMessage) {
    const spotifyClient = new SpotifyCatalog()
    return await spotifyClient.getArtistAlbums(message.params["id"])
  }

  public async artist_tracks(message: JsonRpcMessage) {
    const spotifyClient = new SpotifyCatalog()
    return await spotifyClient.getArtistsTopTracks(message.params["id"])
  }

  public async artist(message: JsonRpcMessage) {
    const spotifyClient = new SpotifyCatalog()
    const res = await spotifyClient.getArtist(message.params["id"])
    return shimNonPaged(res)
  }

  public async artists(message: JsonRpcMessage) {
    const spotifyClient = new SpotifyLibrary()
    return await spotifyClient.getArtists()
  }

  public async describe(message: JsonRpcMessage) {
    const spotifyClient = new SpotifyCatalog()

    if (message.params.length == 0) {
      return []
    }

    return await spotifyClient.describe(message.params["id"])
  }

  public async doesfollow(message: JsonRpcMessage) {
    const spotifyClient = new SpotifyUserLibrary()
    let res = await spotifyClient.doesFollow(message.params["type"], message.params["id"])
    return { id: message.params["id"], following: res }
  }

  public async follow(message: JsonRpcMessage) {
    const spotifyClient = new SpotifyUserLibrary()
    let res = await spotifyClient.follow(message.params["type"], message.params["id"])
    return res
  }

  public async library_add(message: JsonRpcMessage) {
    const spotifyClient = new SpotifyUserLibrary()
    let res = await spotifyClient.saveToLibrary(message.params["id"])
    return res
  }

  public async library_contains(message: JsonRpcMessage) {
    const spotifyClient = new SpotifyUserLibrary()
    let res = await spotifyClient.inLibrary(message.params["id"])
    return { id: message.params["id"], exists: res }
  }

  public async library_remove(message: JsonRpcMessage) {
    const spotifyClient = new SpotifyUserLibrary()
    let res = await spotifyClient.removeFromLibrary(message.params["id"])
    return res
  }

  public async newreleases(message: JsonRpcMessage) {
    const spotifyClient = new SpotifyCatalog()
    return await spotifyClient.getNewAlbums()
  }

  public async playlist(message: JsonRpcMessage) {
    const spotifyClient = new SpotifyLibrary()
    const offset = parseInt(message.params["offset"])
    const limit = parseInt(message.params["limit"])
    return await spotifyClient.getPlaylist(message.params["id"], offset, limit)
  }

  public async playlists(message: JsonRpcMessage) {
    const spotifyClient = new SpotifyLibrary()
    return await spotifyClient.getPlaylists()
  }

  public async queue(message: JsonRpcMessage) {
    const spotifyClient = new SpotifyCatalog()
    return await spotifyClient.getQueue()
  }

  public async show(message: JsonRpcMessage) {
    const spotifyClient = new SpotifyCatalog()
    const offset = parseInt(message.params["offset"])
    const limit = parseInt(message.params["limit"])
    const res = await spotifyClient.getShow(message.params["id"], offset, limit)
    return res
  }

  public async shows(message: JsonRpcMessage) {
    const spotifyClient = new SpotifyLibrary()
    return await spotifyClient.getShows()
  }

  public async tracks(message: JsonRpcMessage) {
    const spotifyClient = new SpotifyLibrary()
    return await spotifyClient.getTracks()
  }

  public async unfollow(message: JsonRpcMessage) {
    const spotifyClient = new SpotifyUserLibrary()
    let res = await spotifyClient.unfollow(message.params["type"], message.params["id"])
    return res
  }
}

export const namespace = "spotify"
export const service = new SpotifyService()

const module: ServiceModule = { namespace, service }
export default module
