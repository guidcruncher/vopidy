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
import { useUiStateStore } from '@/stores/uistatestore'
import { storeToRefs } from 'pinia'
import { useTemplateRef } from 'vue'

const uiStateStore = useUiStateStore()
const { drawer, profileImage, displayMode } = storeToRefs(uiStateStore)

const el = useTemplateRef('el')
const { a, b, c } = useResizer(el, 250)
</script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'

export default {
  name: 'History',
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
      vopidy('player.history', []).then((res) => {
        if (res.ok) {
          this.items = res.result
        }
      })
    },
  },
}
</script>
