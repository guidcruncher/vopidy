<template>
  <v-list lines="two">
    <v-list-item v-for="item in items" :key="item.id" :title="item.name">
      <template v-slot:prepend>
        <v-avatar color="grey-lighten-1">
          <v-icon color="white">mdi-speaker</v-icon>
        </v-avatar>
      </template>

      <template v-slot:append>
        <v-btn
          color="grey-lighten-1"
          icon="mdi-play"
          variant="text"
          @click="selectItem(item)"
        ></v-btn>
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
import { vopidy } from '@/services/vopidy'

export default {
  name: 'StreamBrowse',
  props: {},
  data() {
    return { items: [], url: '' }
  },
  mounted() {
    this.loadItems()
  },
  beforeUnmount() {},
  methods: {
    loadItems() {
      vopidy('stream.browse', {}).then((res) => {
        if (res.ok) {
          this.items = res.result
        }
      })
    },
    selectItem(item) {
      vopidy('player.play', { source: 'stream', id: item.id }).then((res) => {})
    },
  },
}
</script>
