<template>
  <div class="pa-2">
    <v-card>
      <v-slide-group show-arrows>
        <v-slide-group-item v-for="(item, index) in bookmarks" :key="item">
          <div class="pa-1">
            <ScaledImage
              :src="item.image"
              size="sm"
              @click="selectItem(item)"
              v-bind:responsive="false"
              padding="1"
            />
          </div>
        </v-slide-group-item>
      </v-slide-group>
    </v-card>
  </div>
</template>
<style></style>
<script lang="ts" setup></script>
<script lang="ts">
import { emit, off, on } from '@/composables/useeventbus'
import { vopidy } from '@/services/vopidy'

export default {
  name: 'Bookmarks',
  props: {},
  data() {
    return { bookmarks: [] }
  },
  mounted() {
    this.getBookmarks()
    on('vopidy.add-bookmark', () => {
      this.getBookmarks()
    })
  },
  beforeUnmount() {
    off('vopidy.add-bookmark')
  },
  methods: {
    selectItem(item) {
      vopidy('player.play', [item.source, item.id]).then((res) => {
        emit('vopidy.track-changed')
      })
    },
    getBookmarks() {
      vopidy('bookmarks.browse', []).then((res) => {
        if (res.ok) {
          this.bookmarks = res.result
        }
      })
    },
  },
}
</script>
