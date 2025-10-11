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
              <h4><ArtistNames :artists="detail.artist" /></h4>
            </td>
            <td>
              &nbsp;
              <v-btn
                v-if="!following"
                variant="outlined"
                prepend-icon="mdi-bookmark-plus"
                @click="changefollowing(true)"
                >Follow</v-btn
              >
              <v-btn
                v-if="following"
                variant="outlined"
                prepend-icon="mdi-bookmark-minus"
                @click="changefollowing(false)"
                >Unfollow</v-btn
              >
            </td>
          </tr>
        </tbody>
      </table>
      <v-sheet>
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
</template>
<style></style>
<script lang="ts" setup></script>
<script lang="ts">
import { off, on } from '@/composables/useeventbus'
import { vopidy } from '@/services/vopidy'

export default {
  name: 'SpotifyArtist',
  props: {},
  watch: {},
  data() {
    return { id: '', following: false, detail: {}, showDialog: false, tab: 'albums' }
  },
  mounted() {
    on('SpotifyArtist', (data) => {
      this.id = data.id
      this.showDialog = true
      this.loadItem(this.id)
    })
  },
  beforeDestroy() {
    off('SpotifyArtist')
  },
  methods: {
    loadItem(id) {
      if (id == '') {
        return
      }

      vopidy('spotify.doesfollow', { itemtype: 'artist', id: this.id }).then((res) => {
        this.following = res.result.following ?? false
      })

      const method = `spotify.artist`
      vopidy(method, { id: id }).then((res) => {
        if (res.ok) {
          this.detail = res.result
          this.showDialog = true
        }
      })
    },
    selectItem(item) {
      vopidy('player.play', { source: 'spotify', id: item.id }).then((res) => {})
    },
    changefollowing(state) {
      if (state) {
        vopidy('spotify.follow', { itemtype: 'artist', id: this.id }).then((res) => {
          this.following = true
        })
      } else {
        vopidy('spotify.unfollow', { itemtype: 'artist', id: this.id }).then((res) => {
          this.following = false
        })
      }
    },
  },
}
</script>
