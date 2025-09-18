<template>
  <v-dialog v-model="showDialog" fullscreen>
    <v-card>
      <v-toolbar>
        <v-btn icon="mdi-close" @click="showDialog = false"></v-btn>
        <h2>{{ detail.name }}</h2>
      </v-toolbar>
      <table border="0" cellspacing="0" style="padding: 5px">
        <tbody>
          <tr>
            <td>
              <ScaledImage :src="detail.image" size="md" padding="5" />
              <img
                v-if="detail.barcodeUrl"
                :src="detail.barcodeUrl"
                @load="visible = true"
                v-show="visible"
                style="width: 110px"
              />
            </td>
            <td align="left">
              <h4><ArtistNames v-if="detail.artist" :artists="detail.artist" /></h4>
              <v-btn prepend-icon="mdi-play" variant="outlined" @click="selectItem(detail)"
                >Play all</v-btn
              >&nbsp;
              <v-btn
                v-if="detail && (detail.type == 'album' || detail.type == 'artist')"
                prepend-icon="mdi-playlist-plus"
                variant="outlined"
                @click="createPlaylist(detail)"
                >Add to Playlist</v-btn
              >
              &nbsp;
              <v-btn
                v-if="detail && (detail.type == 'album' || detail.type == 'artist')"
                prepend-icon="mdi-party-popper"
                variant="outlined"
                @click="createPartyList(detail)"
                >Create Party</v-btn
              >
            </td>
          </tr>
        </tbody>
      </table>

      <v-sheet v-if="detail && detail.type == 'artist'">
        <v-tabs v-model="tab" bg-color="bg-purple-darken-2">
          <v-tab value="albums">Albums</v-tab>
          <v-tab value="tracks">Top Tracks</v-tab>
        </v-tabs>

        <v-list lines="two" v-if="tab == 'albums'">
          <v-list-item v-for="item in detail.albums" :key="item.id" :title="item.name">
            <template v-slot:prepend>
              <v-avatar color="grey-lighten-1">
                <v-icon color="white" v-if="tab == 'albums'">mdi-album</v-icon>
                <v-icon color="white" v-if="tab == 'tracks'">mdi-speaker</v-icon>
                <v-icon color="white" v-if="tab == 'playlists'">mdi-playlist-music</v-icon>
                <v-icon color="white" v-if="tab == 'shows'">mdi-podcast</v-icon>
              </v-avatar>
            </template>
            <v-list-item-subtitle>
              {{ item.album_type }} {{ item.popularity }}
            </v-list-item-subtitle>
            <template v-slot:append>
              <v-btn
                color="grey-lighten-1"
                icon="mdi-play"
                variant="text"
                @click="selectItem(item)"
              ></v-btn>
              <v-btn
                color="grey-lighten-1"
                icon="mdi-information"
                variant="text"
                @click="getInformation(item)"
              ></v-btn>
            </template>
          </v-list-item>
        </v-list>

        <v-list lines="two" v-if="tab == 'tracks'">
          <v-list-item v-for="item in detail.tracks" :key="item.id" :title="item.name">
            <template v-slot:prepend>
              <v-avatar color="grey-lighten-1">
                <v-icon color="white" v-if="tab == 'albums'">mdi-album</v-icon>
                <v-icon color="white" v-if="tab == 'tracks'">mdi-speaker</v-icon>
                <v-icon color="white" v-if="tab == 'playlists'">mdi-playlist-music</v-icon>
                <v-icon color="white" v-if="tab == 'shows'">mdi-podcast</v-icon>
              </v-avatar>
            </template>
            <v-list-item-subtitle>
              {{ item.album }}
            </v-list-item-subtitle>
            <template v-slot:append>
              <v-btn
                color="grey-lighten-1"
                icon="mdi-play"
                variant="text"
                @click="selectItem(item)"
              ></v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-sheet>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showCreatePl">
    <v-card :title="plTitle">
      <v-card-text>
        <v-combobox
          item-title="name"
          item-value="id"
          :items="playlistsAvailable"
          clearable
          label="Playlist name"
          v-model="plName"
        ></v-combobox>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text="Save" @click="doCreatePl()" :disabled="plName == ''"></v-btn>
        <v-btn text="Cancel" @click="showCreatePl = false"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<style></style>
<script lang="ts" setup></script>
<script lang="ts">
import { emit, off, on } from '@/composables/useeventbus'
import { vopidy } from '@/services/vopidy'

export default {
  name: 'SpotifyArtistDetail',
  data() {
    return {
      windowSize: { x: 0, y: 300 },
      offset: 0,
      limit: 10,
      showCreatePl: false,
      items: [] as any,
      id: '',
      detail: {},
      page: 1,
      plType: '',
      plTitle: 'Add to playlist',
      playlistsAvailable: [],
      showDialog: false,
      tab: 'albums',
      plName: '',
      plUris: [],
    }
  },
  mounted() {
    this.onResize()
    on('showartistdetail', (id) => {
      this.id = id
      this.loadData({ done: () => {} })
      this.showDialog = true
    })
  },
  beforeUnmount() {
    off('showartistdetail')
  },
  methods: {
    show() {
      this.showDialog = true
    },
    onResize() {
      this.windowSize = { x: window.innerWidth, y: window.innerHeight - 300 }
    },
    doCreatePl() {
      vopidy('create.playlist', [this.plName, this.plUris]).then((res) => {
        if (res.ok) {
          this.plName = ''
          this.plUris = []
          this.showCreatePl = false
        }
      })
    },
    selectPage(newPage) {
      const offset = (newPage - 1) * this.limit
      this.loadItem(this.id, offset, this.limit)
    },
    loadData({ done }) {
      const segments = this.id.split(':')
      const method = `spotify.${segments[1]}`
      vopidy(method, [this.id, this.offset, this.limit]).then((res) => {
        if (res.ok) {
          this.detail = res.result
          if (res.result.items) {
            if (res.result.items.length > 0) {
              this.items.push(...res.result.items)
              this.offset = res.result.offset
              this.limit = res.result.limit
              this.ready = true
              this.offset += this.limit
              done('ok')
            } else {
              done('empty')
            }
          } else {
            done('empty')
          }
        } else {
          done('error')
        }
      })
    },
    selectItem(item) {
      vopidy('player.play', ['spotify', item.id]).then((res) => {})
    },
    createPartyList(detail) {
      let uris = []
      let suffix = ' Party!'
      this.plType = 'party'

      switch (detail.type) {
        case 'album':
          this.plName = detail.name + ' by ' + detail.artist.map((t) => t.name).join(', ') + suffix
          uris = detail.items.map((t) => {
            return t.id
          })
          break
        case 'artist':
          switch (this.tab) {
            case 'albums':
              this.plName = detail.name + ' albums' + suffix
              uris = detail.albums.map((t) => {
                return t.id
              })
              break
            case 'tracks':
              this.plName = detail.name + ' top tracks' + suffix
              uris = detail.tracks.map((t) => {
                return t.id
              })
              break
          }
          break
      }
      vopidy('spotify.playlists', []).then((playlists) => {
        this.playlistsAvailable = playlists.result
        this.plTitle = 'Add to party'
        this.plUris = this.randomizeList(uris)
        this.showCreatePl = true
      })
    },
    createPlaylist(detail) {
      let uris = []
      this.plType = 'playlist'

      switch (detail.type) {
        case 'album':
          this.plName = detail.name + ' by ' + detail.artist.map((t) => t.name).join(', ')
          uris = detail.items.map((t) => {
            return t.id
          })
          break
        case 'artist':
          switch (this.tab) {
            case 'albums':
              this.plName = detail.name + ' albums'
              uris = detail.albums.map((t) => {
                return t.id
              })
              break
            case 'tracks':
              this.plName = detail.name + ' top tracks'
              uris = detail.tracks.map((t) => {
                return t.id
              })
              break
          }
          break
      }

      vopidy('spotify.playlists', []).then((playlists) => {
        this.playlistsAvailable = playlists.result
        this.plTitle = 'Add to playlist'
        this.plUris = uris
        this.showCreatePl = true
      })
    },
    getInformation(item) {
      emit('showitemdetail', item.id)
    },
    playParty(detail) {
      let uris = []
      switch (this.tab) {
        case 'albums':
          this.plName = detail.name + ' albums' + suffix
          uris = detail.albums.map((t) => {
            return t.id
          })
          break
        case 'tracks':
          this.plName = detail.name + ' top tracks' + suffix
          uris = detail.tracks.map((t) => {
            return t.id
          })
          break
      }
      uris = this.randomizeList(uris)
    },
    randomizeList(items) {
      let shuffled = JSON.parse(JSON.stringify(items))
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
      return shuffled
    },
  },
}
</script>
