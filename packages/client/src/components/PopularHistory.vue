<template>
  <v-card ref="el">
    <div :style="{ 'overflow-y': 'scroll', height: size.height }">
      <div class="wrapgrid">
        <div v-for="(item, index) in items" class="cell">
          <center>
            <ScaledImage
              :src="item.image"
              size="lg"
              @click="selectItem(item)"
              v-bind:responsive="false"
            />
            <div
              @click="selectItem(item)"
              class="text-caption"
              style="height: 40px; overflow: hidden"
            >
              {{ item.name }}
            </div>
          </center>
        </div>
      </div>
    </div>
  </v-card>
</template>
<style>
.wrapgrid {
  display: block;
  width: v-bind('gridwidth');
  position: relative;
}
.cell {
  display: inline-block;
  position: relative;
  width: 150px;
  height: 150px;
  margin: 6px;
}
</style>
<script lang="ts" setup>
import { emit, off, on } from '@/composables/useeventbus'
import { useResizer } from '@/composables/useresizer'
import { useUiStateStore } from '@/stores/uistatestore'
import { storeToRefs } from 'pinia'
import { useTemplateRef } from 'vue'

const uiStateStore = useUiStateStore()
const { drawer, profileImage, displayMode } = storeToRefs(uiStateStore)

const el = useTemplateRef('el')
const { a, b, c } = useResizer(el, 230)
</script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'

export default {
  name: 'PopularHistory',
  props: {},
  data() {
    return { items: [], cols: 4, size: { width: '100%', height: '100%' } }
  },
  mounted() {
    on('resized', (prop) => {
      this.cols = prop.cols
      this.size = prop.size
    })
    this.getHistory()
  },
  beforeUnmount() {
    off('resized')
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
