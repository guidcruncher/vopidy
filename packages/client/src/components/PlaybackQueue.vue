<template>
  <v-list lines="two">
    <v-list-item v-for="item in items" :key="item.id" :title="item.name" @click="selectItem(item)">
      <template v-slot:prepend>
        <v-avatar color="grey-lighten-1">
          <v-icon color="white">mdi-speaker</v-icon>
        </v-avatar>
      </template>
      <v-list-item-subtitle>
        <ArtistNames :artists="item.artist" />
      </v-list-item-subtitle>
      <template v-slot:append>
        <v-btn color="grey-lighten-1" icon="mdi-information" variant="text"></v-btn>
      </template>
    </v-list-item>
  </v-list>
</template>
<style>
.v-list {
  height: 90 %;
  overflow-y: auto;
}
</style>
<script lang="ts" setup></script>
<script lang="ts">
import { off, on } from '@/composables/useeventbus'
import { vopidy } from '@/services/vopidy'

export default {
  name: 'PlaybackQueue',
  props: {},
  data() {
    return { items: [] }
  },
  mounted() {
    this.loadQueue()
    on('vopidy.track-changed', () => {
      this.loadQueue()
    })
  },
  beforeUnmount() {
    off('vopidy.track-changed')
  },
  methods: {
    loadQueue() {
      const method = `spotify.queue`
      vopidy(method, {}).then((res) => {
        if (res.ok) {
          this.items = res.result
        }
      })
    },
    selectItem(item) {
      vopidy('player.play', { source: 'spotify', id: item.id }).then((res) => {})
    },
  },
}
</script>
