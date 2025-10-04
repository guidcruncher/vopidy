<script lang="ts">
import { emit } from '@/composables/useeventbus'

export default {
  name: 'ArtistNames',
  props: {
    artists: {
      type: Array,
      required: true,
    },
    variant: {
      type: String,
      default: 'pill',
    },
  },
  data() {
    return { selectedId: '' }
  },
  computed: {
    getArtists() {
      if (!this.artists) {
        return ''
      }

      if (Array.isArray(this.artists)) {
        return this.artists.filter((a) => {
          if (a.name) {
            if (a.name.trim() != '') {
              return { id: a.id, name: a.name.trim() }
            }
          } else {
            if (a.trim() != '') {
              return { id: '', name: a.trim() }
            }
          }
        })
      }
      return [{ name: this.artists.trim(), id: '' }]
    },
  },
  mounted() {},
  beforeUnmount() {},
  methods: {
    artistInfo(item) {
      if (!item.id || item.id == '') {
        return
      }
      this.selectedId = 'spotify:artist:' + item.id
      emit('SpotifyArtist', { id: this.selectedId })
    },
  },
}
</script>
<template>
  <span v-if="variant == 'text'" v-for="(item, index) in getArtists"
    ><span v-if="item.name.trim() != ''"
      >{{ item.name }}<span v-if="index < artists.length - 1">, </span></span
    ></span
  >
  <span v-if="variant == 'pill'">
    <v-chip @click="artistInfo(item)" :disabled="!item.id" v-for="(item, index) in getArtists">
      {{ item.name }}
    </v-chip>
  </span>

  <SpotifyArtist :id="selectedId" />
</template>
<style></style>
