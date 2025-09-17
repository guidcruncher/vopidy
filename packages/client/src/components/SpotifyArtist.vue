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
import { vopidy } from '@/services/vopidy'

export default {
  name: 'SpotifyArtist',
  props: {
    id: {
      type: String,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
  },
  watch: {
    id: function (val) {
      if (val != '') {
        this.loadItem(val)
      } else {
        this.detail = {}
      }
    },
  },
  data() {
    return { detail: {}, showDialog: false, tab: 'albums' }
  },
  mounted() {
    this.loadItem(this.id)
  },
  beforeUnmount() {},
  methods: {
    loadItem(id) {
      if (id == '') {
        return
      }
      const method = `spotify.artist`
      vopidy(method, [id]).then((res) => {
        if (res.ok) {
          this.detail = res.result
          this.showDialog = true
        }
      })
    },
    selectItem(item) {
      vopidy('player.play', ['spotify', item.id]).then((res) => {})
    },
  },
}
</script>
