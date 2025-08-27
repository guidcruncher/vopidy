<script lang="ts">
import { ref } from 'vue'

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
    return { selectedId: '', showInfo: false }
  },
  mounted() {},
  beforeUnmount() {},
  methods: {
    artistInfo(item) {
      this.selectedId = item.id
      this.showInfo = true
    },
  },
}
</script>
<template>
  <span v-if="variant == 'text'" v-for="(item, index) in artists"
    >{{ item.name }}<span v-if="index < artists.length - 1">, </span></span
  >
  <span v-if="variant == 'pill'">
    <v-chip @click="artistInfo(item)" v-for="(item, index) in artists">
      {{ item.name }}
    </v-chip>
  </span>

  <SpotifyArtist :show="showInfo" :id="selectedId" />
</template>
<style></style>
