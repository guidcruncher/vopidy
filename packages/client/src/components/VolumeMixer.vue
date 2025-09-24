<template>
  <div class="pa-2" v-if="canMix">
    <h3>Master Volume</h3>
    <center>
      <v-slider
        min="0"
        max="100"
        show-ticks
        tick-size="1"
        :disabled="!canMix"
        step="1"
        thumb-label
        v-model="volume"
        @end="setVolume"
      >
        <template v-slot:prepend>
          <v-btn
            v-if="!muted"
            icon="mdi-volume-mute"
            variant="outlined"
            density="compact"
            @click="mute()"
          ></v-btn>
          <v-btn
            v-if="muted"
            icon="mdi-volume-high"
            variant="outlined"
            density="compact"
            @click="unmute()"
          ></v-btn>
        </template>
      </v-slider>
    </center>
  </div>
</template>
<style></style>
<script lang="ts" setup></script>
<script lang="ts">
import { off, on } from '@/composables/useeventbus'
import { vopidy } from '@/services/vopidy'

export default {
  name: 'VolumeMixer',
  props: {},
  data() {
    return { volume: 100, canMix: false, muted: false, ready: false }
  },
  mounted() {
    vopidy('core.config-get', []).then((res) => {
      if (res.ok) {
        this.canMix = !(res.result.enableBitPerfectPlayback === 'true')
        if (this.canMix) {
          this.getVolume()
          on('vopidy.spotify.volume', () => {
            this.getVolume()
          })
        }
      }
    })
  },
  beforeUnmount() {
    off('vopidy.spotify.volume')
  },
  methods: {
    mute() {
      vopidy(`mixer.mute`, []).then((res) => {
        this.muted = true
      })
    },
    unmute() {
      vopidy(`mixer.unmute`, []).then((res) => {
        this.muted = false
      })
    },
    setVolume() {
      vopidy(`mixer.setvolume`, [this.volume]).then((res) => {
        if (res.ok) {
        }
      })
    },
    getVolume() {
      vopidy('core.status', []).then((res) => {
        if (res.ok) {
          if (res.result.volume) {
            this.volume = res.result.volume
            this.muted = res.result.muted
            this.ready = true
          } else {
            this.ready = false
          }
        }
      })
    },
  },
}
</script>
