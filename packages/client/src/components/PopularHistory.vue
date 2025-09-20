<template>
  <v-card ref="el">
    <div :style="{ 'overflow-y': 'scroll', height: size.height }">
      <div class="pa-2">
        <v-row no-gutters class="icon-pophistcols">
          <v-col v-for="(item, index) in items">
            <div style="padding: 2px">
              <center>
                <ScaledImage
                  :src="item.image"
                  size="lg"
                  @click="selectItem(item)"
                  v-bind:responsive="false"
                />
                <span class="text-caption">{{ item.name }} ({{ item.total }})</span>
              </center>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>
  </v-card>
</template>
<style>
.icon-pophistcols {
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
  emit('pophist-col-change', computed)
  height = window.innerHeight
  emit('popresized', { width: width, height: (height - 250).toString() + 'px' })
})
</script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'
import { useResizeObserver } from '@vueuse/core'
import { useTemplateRef } from 'vue'

export default {
  name: 'PopularHistory',
  props: {},
  data() {
    return { items: [], cols: 4, size: { width: '100%', height: '100%' } }
  },
  mounted() {
    on('pophist-col-change', (col) => {
      this.cols = col
    })
    on('popresized', (size) => {
      this.size = size
    })
    this.getHistory()
  },
  beforeUnmount() {
    off('popresized')
    off('pophist-col-change')
  },
  methods: {
    selectItem(item) {
      vopidy('player.play', [item.source, item.uri]).then((res) => {
        emit('vopidy.track-changed')
      })
    },
    getHistory() {
      vopidy('player.history.popular', []).then((res) => {
        if (res.ok) {
          this.items = res.result
        }
      })
    },
  },
}
</script>
