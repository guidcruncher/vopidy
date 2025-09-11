<template>
  <v-tabs v-model="tab" bg-color="bg-purple-darken-2" fixed-tabs @click="refreshTab()">
    <v-tab value="albums">Albums</v-tab>
    <v-tab value="tracks">Tracks</v-tab>
    <v-tab value="playlists">Playlists</v-tab>
    <v-tab value="shows">Shows</v-tab>
    <v-tab value="artists">Artists</v-tab>
  </v-tabs>
  <v-chip v-if="displayMode == 'grid'" prepend-icon="mdi-view-list" @click="displayMode = 'list'"
    >Grid</v-chip
  >
  <v-chip v-if="displayMode == 'list'" prepend-icon="mdi-view-grid" @click="displayMode = 'grid'"
    >List</v-chip
  >
  <v-sheet v-if="displayMode == 'list'">
    <v-list lines="two">
      <v-list-item v-for="item in items" :key="item.id">
        <template v-slot:prepend>
          <v-avatar color="grey-lighten-1">
            <v-icon color="white" v-if="tab == 'albums'">mdi-album</v-icon>
            <v-icon color="white" v-if="tab == 'tracks'">mdi-speaker</v-icon>
            <v-icon color="white" v-if="tab == 'playlists'">mdi-playlist-music</v-icon>
            <v-icon color="white" v-if="tab == 'shows'">mdi-podcast</v-icon>
            <v-icon color="white" v-if="tab == 'artists'">mdi-account-music</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title>{{ item.name }}</v-list-item-title>
        <v-list-item-subtitle>
          <span v-if="tab == 'artists' && item.genres"> {{ item.genres.join(', ') }}</span>
          <span v-if="tab == 'shows'"> {{ item.publisher }}</span>
          <span v-if="tab == 'playlists'">{{ item.owner }}</span>
          <ArtistNames v-if="tab != 'playlists' && tab != 'artists'" :artists="item.artist" />
        </v-list-item-subtitle>
        <template v-slot:append>
          <v-btn
            color="grey-lighten-1"
            icon="mdi-play"
            v-if="tab != 'artists'"
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
  </v-sheet>
  <v-sheet v-if="displayMode == 'grid'" ref="el">
    <div class="wrapgrid">
      <div v-for="(item, index) in items" class="cell">
        <center>
          <ScaledImage
            :src="item.image"
            size="lg"
            v-if="tab != 'tracks'"
            @click="getInformation(item)"
            v-bind:responsive="false"
          />
          <ScaledImage
            :src="item.image"
            size="lg"
            v-else
            @click="selectItem(item)"
            v-bind:responsive="false"
          />
          <div
            @click="selectItem(item)"
            class="text-caption"
            style="height: 40px; overflow: hidden"
          >
            {{ item.name }}
          </div>
        </center>
      </div>
    </div>
  </v-sheet>
  <SpotifyItemDetail />
  <SpotifyArtistDetail />
</template>
<style>
.v-list {
  height: 90 %;
  overflow-y: auto;
}
.wrapgrid {
  display: block;
  width: v-bind('gridwidth');
  position: relative;
}
.cell {
  display: inline-block;
  position: relative;
  width: 150px;
  height: 150px;
  margin: 6px;
}
</style>
<script lang="ts" setup>
import { emit, off, on } from '@/composables/useeventbus'
import { useUiStateStore } from '@/stores/uistatestore'
import { useResizeObserver } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { useTemplateRef } from 'vue'

const uiStateStore = useUiStateStore()
const { drawer, profileImage, displayMode } = storeToRefs(uiStateStore)

const el = useTemplateRef('el')
useResizeObserver(el, (entries) => {
  const entry = entries[0]
  const { width, height } = entry.contentRect
  emit('sb-col-change', width)
})
</script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'

export default {
  name: 'SpotifyBrowse',
  props: {},
  data() {
    return {
      cols: 4,
      tab: 'albums',
      items: [],
    }
  },
  mounted() {
    this.cols = 4
    on('sb-col-change', (col) => {
      this.cols = col
    })

    if (this.tab) {
      this.showInfo = false
      this.refreshTab()
    }
  },
  beforeUnmount() {
    off('sb-col-change')
  },
  methods: {
    refreshTab() {
      const method = `spotify.${this.tab}`
      vopidy(method, []).then((res) => {
        if (res.ok) {
          this.items = res.result
        }
      })
    },
    selectItem(item) {
      vopidy('player.play', ['spotify', item.id]).then((res) => {})
    },
    getInformation(item) {
      if (this.tab == 'artists') {
        emit('showartistdetail', item.id)
      } else {
        emit('showitemdetail', item.id)
      }
    },
  },
}
</script>
