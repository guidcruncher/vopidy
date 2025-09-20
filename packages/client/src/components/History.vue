<template>
  <v-card ref="el">
    <div :style="{ 'overflow-y': 'scroll', height: size.height }">
      <div class="pa-2">
        <v-row no-gutters class="icon-histcols">
          <v-col v-for="(item, index) in items">
            <div style="padding: 2px">
              <center>
                <ScaledImage
                  :src="item.image"
                  size="lg"
                  @click="selectItem(item)"
                  v-bind:responsive="false"
                />
                <span class="text-caption">{{ item.name }}</span>
              </center>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>
  </v-card>
</template>
<style>
.icon-histcols {
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
  height = window.innerHeight
  emit('histresized', { width: width, height: (height - 250).toString() + 'px' })
  emit('hist-col-change', computed)
})
</script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'
import { useResizeObserver } from '@vueuse/core'
import { useTemplateRef } from 'vue'

export default {
  name: 'History',
  props: {},
  data() {
    return { items: [], cols: 4, size: { width: '100%', height: '100%' } }
  },
  mounted() {
    on('hist-col-change', (col) => {
      this.cols = col
    })
    on('histresized', (size) => {
      this.size = size
    })
    this.getHistory()
  },
  beforeUnmount() {
    off('histresized')
    off('hist-col-change')
  },
  methods: {
    selectItem(item) {
      vopidy('player.play', [item.source, item.uri]).then((res) => {
        emit('vopidy.track-changed')
      })
    },
    getHistory() {
      vopidy('player.history', []).then((res) => {
        if (res.ok) {
          this.items = res.result
        }
      })
    },
  },
}
</script>
