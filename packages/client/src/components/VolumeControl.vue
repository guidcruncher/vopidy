<template>
  <div class="pa-2" v-if="canMix">
    <center>
      <v-slider
        min="0"
        max="100"
        show-ticks
        tick-size="1"
        persistent-hint
        max-width="250"
        hint="Adjust volume level"
        :disabled="!canMix"
        step="1"
        thumb-label
        v-model="volume"
        @end="setVolume"
      ></v-slider>
    </center>
  </div>
</template>
<style></style>
<script lang="ts" setup></script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'
import { on, emit, off } from '@/composables/useeventbus'

export default {
  name: 'VolumeControl',
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
        if (res.ok) {
          this.getVolume()
        }
      })
    },
    unmute() {
      vopidy(`mixer.unmute`, []).then((res) => {
        if (res.ok) {
          this.getVolume()
        }
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
