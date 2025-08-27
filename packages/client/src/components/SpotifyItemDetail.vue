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
            </td>
            <td align="left">
              <h4><ArtistNames :artists="detail.artist" /></h4>
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
            </td>
          </tr>
        </tbody>
      </table>

      <v-sheet>
        <v-infinite-scroll
          v-if="ready"
          :height="windowSize.y"
          v-resize="onResize"
          :items="items"
          @load="loadData"
        >
          <v-list lines="two">
            <v-list-item v-for="item in items" :key="item.id" :title="item.name">
              <template v-slot:prepend>
                <v-avatar color="grey-lighten-1">
                  <v-icon color="white" v-if="item.type == 'album'">mdi-album</v-icon>
                  <v-icon color="white" v-if="item.type == 'track'">mdi-speaker</v-icon>
                  <v-icon color="white" v-if="item.type == 'episode'">mdi-podcast</v-icon>
                </v-avatar>
              </template>
              <v-list-item-subtitle>
                <ArtistNames :artists="item.artist" />
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
        </v-infinite-scroll>
      </v-sheet>
    </v-card>

    <v-dialog v-model="showCreatePl">
      <v-card title="Add to playlist">
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
          <v-btn text="Save" @click="doCreatePl()" :disasbled="plName == ''"></v-btn>
          <v-btn text="Cancel" @click="showCreatePl = false"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>
<style></style>
<script lang="ts" setup></script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'
import { on, emit, off } from '@/composables/useeventbus'

export default {
  name: 'SpotifyItemDetail',
  data() {
    return {
      windowSize: { x: 0, y: 300 },
      offset: 0,
      limit: 10,
      ready: false,
      showCreatePl: false,
      items: [] as any,
      page: 1,
      id: '',
      detail: {},
      playlistsAvailable: [],
      tab: 'albums',
      plName: '',
      plUris: [],
      showDialog: false,
    }
  },
  mounted() {
    this.onResize()
    on('showitemdetail', (id) => {
      this.offset = 0
      this.limit = 10
      this.items = []
      this.detail = {}
      this.id = id
      this.showDialog = true
      this.loadData({ done: () => {} })
    })
  },
  beforeUnmount() {
    off('showitemdetail')
  },
  methods: {
    show() {
      this.showDialog = true
    },
    onResize() {
      this.windowSize = { x: window.innerWidth, y: window.innerHeight - 240 }
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
          if (res.result.content.items.length > 0) {
            if (this.offset > 0 && segments[1] == 'album') {
              done('empty')
            } else {
              this.items.push(...res.result.content.items)
              this.ready = true
              this.offset += this.limit
              done('ok')
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
    createPlaylist(detail) {
      let uris = []
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
        this.plUris = uris
        this.showCreatePl = true
      })
    },
  },
}
</script>
