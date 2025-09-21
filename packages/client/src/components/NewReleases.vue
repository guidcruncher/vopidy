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
  name: 'NewReleases',
  props: {},
  data() {
    return { items: [], cols: 4, size: { width: '100%', height: '100%' } }
  },
  mounted() {
    on('resized', (prop) => {
      this.cols = prop.cols
      this.size = prop.size
    })
    this.getNewReleases()
  },
  beforeUnmount() {
    off('resized')
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
