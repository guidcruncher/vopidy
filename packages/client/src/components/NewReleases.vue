<template>
  <v-card ref="el">
    <div :style="{ 'overflow-y': 'scroll', height: size.height }">
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
import { emit, off, on } from '@/composables/useeventbus'
const el = useTemplateRef('el')
useResizeObserver(el, (entries) => {
  const entry = entries[0]
  let { width, height } = entry.contentRect
  let computed = Math.floor(width / 170)
  if (computed < 1) {
    computed = 1
  }
  emit('new-col-change', computed)
  height = window.innerHeight
  emit('newresized', { width: width, height: (height - 250).toString() + 'px' })
})
</script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'
import { useResizeObserver } from '@vueuse/core'
import { useTemplateRef } from 'vue'

export default {
  name: 'NewReleases',
  props: {},
  data() {
    return { items: [], cols: 4, size: { width: '100%', height: '100%' } }
  },
  mounted() {
    on('new-col-change', (col) => {
      this.cols = col
    })

    on('newresized', (size) => {
      this.size = size
    })
    this.getNewReleases()
  },
  beforeUnmount() {
    off('newresized')
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
