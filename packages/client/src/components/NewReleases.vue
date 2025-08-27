<template>
  <v-card ref="el">
    <div class="pa-2">
      <v-row no-gutters class="icon-newcols">
        <v-col v-for="(item, index) in items">
          <div style="padding: 2px">
            <center>
              <ScaledImage
                :src="item.image"
                size="lg"
                @click="selectItem(item)"
                v-bind:responsive="false"
              />
              <ArtistNames :artists="item.artist" />
            </center>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>
<style>
.icon-newcols {
  display: grid;
  grid-template-columns: repeat(v-bind('cols'), 1fr);
}
</style>
<script lang="ts" setup>
import { on, emit, off } from '@/composables/useeventbus'
const el = useTemplateRef('el')
useResizeObserver(el, (entries) => {
  const entry = entries[0]
  const { width, height } = entry.contentRect
  let computed = Math.floor(width / 170)
  if (computed < 1) {
    computed = 1
  }
  emit('new-col-change', computed)
})
</script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'
import { on, emit, off } from '@/composables/useeventbus'
import { useResizeObserver } from '@vueuse/core'
import { ref, useTemplateRef } from 'vue'

export default {
  name: 'NewReleases',
  props: {},
  data() {
    return { items: [], cols: 4 }
  },
  mounted() {
    on('new-col-change', (col) => {
      this.cols = col
    })
    this.getNewReleases()
  },
  beforeUnmount() {
    off('new-col-change')
  },
  methods: {
    selectItem(item) {
      vopidy('player.play', ['spotify', item.id]).then((res) => {
        emit('vopidy.track-changed')
      })
    },
    getNewReleases() {
      vopidy('spotify.newreleases', []).then((res) => {
        if (res.ok) {
          this.items = res.result
        }
      })
    },
  },
}
</script>
