<template>
  <div class="pa-2">
    <v-row no-gutters>
      <v-col>
        <v-select v-model="catalog" label="Search for" :items="catalogs"></v-select>
      </v-col>
      <v-col>
        <v-text-field clearable label="Query" v-model="query"></v-text-field>
      </v-col>
    </v-row>

    <v-btn
      prepend-icon="mdi-magnify"
      :disabled="catalog == '' || query == ''"
      variant="outlined"
      @click="search()"
      >Search</v-btn
    >&nbsp;
    <v-btn
      prepend-icon="mdi-magnify"
      :disabled="catalog == '' || query == ''"
      variant="outlined"
      @click="searchChoose()"
      >I'm Feeling Lucky
    </v-btn>
    &nbsp;
    <span v-if="results.total == 0">No results</span>
    <span v-if="results.total == 1">1 result</span>
    <span v-if="results.total > 1">{{ results.total }} results</span>
  </div>
  <v-sheet>
    <v-list lines="two" v-if="results.total > 0">
      <v-list-item v-for="item in results.items" :key="item.id">
        <template v-slot:prepend>
          <v-avatar color="grey-lighten-1">
            <v-icon color="white" v-if="item.type == 'album'">mdi-album</v-icon>
            <v-icon color="white" v-if="item.type == 'tunein' || item.type == 'radiobrowser'"
              >mdi-radio</v-icon
            >
            <v-icon color="white" v-if="item.type == 'stream'">mdi-music</v-icon>
            <v-icon color="white" v-if="item.type == 'track'">mdi-speaker</v-icon>
            <v-icon color="white" v-if="item.type == 'playlist'">mdi-playlist-music</v-icon>
            <v-icon color="white" v-if="item.type == 'show'">mdi-podcast</v-icon>
            <v-icon color="white" v-if="item.type == 'artist'">mdi-account-music</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title>{{ item.name }}</v-list-item-title>
        <v-list-item-subtitle>
          <span v-if="item.type == 'artist' && item.genres"> {{ item.genres.join(', ') }}</span>
          <span v-if="item.type == 'show'"> {{ item.publisher }}</span>
          <span v-if="item.type == 'playlist'">{{ item.owner }}</span>
          <ArtistNames
            v-if="item.type != 'show' && item.type != 'playlist' && item.type != 'artist'"
            :artists="item.artist"
          />
        </v-list-item-subtitle>
        <template v-slot:append>
          <v-btn
            color="grey-lighten-1"
            icon="mdi-play"
            v-if="item.type != 'artist'"
            variant="text"
            @click="selectItem(item)"
          ></v-btn>
          <v-btn
            color="grey-lighten-1"
            icon="mdi-information"
            variant="text"
            v-if="catalog != 'radiobrowser' && catalog != 'tunein' && catalog != 'stream'"
            @click="getInformation(item)"
          ></v-btn>
        </template>
      </v-list-item>
    </v-list>
    <v-pagination
      v-model="page"
      @update:model-value="selectPage"
      v-if="results.total > 0"
      :disabled="results.total < results.limit"
      :length="results.pageTotal"
      :total-visible="5"
      rounded="circle"
    ></v-pagination>
  </v-sheet>

  <SpotifyItemDetail />
  <SpotifyArtistDetail />
</template>
<style></style>
<script lang="ts" setup></script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'
import { on, emit, off } from '@/composables/useeventbus'
import { PagedItems } from '@/core/paging'

export default {
  name: 'SearchMusic',
  props: {},
  data() {
    return {
      page: 1,
      pageSize: 7,
      pageTotal: 0,
      catalog: '',
      catalogs: [],
      query: '',
      results: {},
    }
  },
  mounted() {
    this.results = new PagedItems()
    this.getCatalogs()
  },
  beforeUnmount() {},
  methods: {
    getCatalogs() {
      this.catalogs = [
        { title: 'Albums', value: 'spotify:album' },
        { title: 'Artists', value: 'spotify:artist' },
        { title: 'Episodes', value: 'spotify:episode' },
        { title: 'Playlists', value: 'spotify:playlist' },
        { title: 'Tracks', value: 'spotify:track' },
        { title: 'Shows', value: 'spotify:show' },
        { title: 'Streams', value: 'stream' },
        { title: 'Tunein', value: 'tunein' },
        { title: 'RadioBrowser', value: 'radiobrowser' },
      ].sort((a, b) => a.title.localeCompare(b.title))
    },
    search() {
      this.page = 1
      this.pageTotal = 0
      this.results = new PagedItems()
      this.pagedSearch(0, this.pageSize)
    },
    selectItem(item) {
      vopidy('player.play', [item.source, item.id]).then((res) => {})
    },
    searchChoose() {
      this.page = 1
      this.pageTotal = 0
      this.results = new PagedItems()
      vopidy('search.keyword', [this.catalog, this.query, 0, this.pageSize]).then((res) => {
        if (res.ok) {
          this.pageTotal = res.result.pageTotal
          this.page = res.result.page
          this.results = res.result
          this.selectItem(res.result.items[0])
        }
      })
    },
    selectPage(newPage) {
      if (this.results.total > 0) {
        const offset = (newPage - 1) * this.results.limit
        this.pagedSearch(offset, this.results.limit)
      }
    },
    pagedSearch(offset, limit) {
      vopidy('search.keyword', [this.catalog, this.query, offset, limit]).then((res) => {
        if (res.ok) {
          this.pageTotal = res.result.pageTotal
          this.page = res.result.page
          this.results = res.result
        }
      })
    },
    getInformation(item) {
      if (this.catalog == 'spotify:artist') {
        emit('showartistdetail', item.id)
      } else {
        emit('showitemdetail', item.id)
      }
    },
  },
}
</script>
