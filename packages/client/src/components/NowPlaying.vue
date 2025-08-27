<template>
  <div class="pa-2">
    <center>
      <div class="pa-2">
        <ScaledImage :src="status.track.image" size="xxl" v-if="ready" padding="5" />
        <h2 v-if="status.track">{{ status.track.name }}</h2>
        <h3 v-if="status.track && status.track.nowplaying">{{ status.track.nowplaying }}</h3>
        <h3 v-if="!status.track && status.track.nowplaying">{{ status.track.album }}</h3>
        <h4 v-if="status.track">
          <ArtistNames v-if="status.track.artist" :artists="status.track.artist" />
        </h4>
        <v-slider
          hint="Playback position"
          persistent-hint
          max-width="250"
          readonly
          v-if="status.position"
          min="0"
          :max="status.position.duration"
          v-model="status.position.progress"
        />
      </div>
    </center>
  </div>
</template>
<style></style>
<script lang="ts" setup></script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'
import { on, emit, off } from '@/composables/useeventbus'

export default {
  name: 'NowPlaying',
  props: {},
  data() {
    return {
      hasaudio: false,
      intervalHandle: 0,
      status: { track: { image: '/images/noplay1.webp' } },
      ready: false,
    }
  },
  mounted() {
    this.getStatus()
    on('vopidy.track-changed', () => {
      this.getStatus()
    })
    on('player-command', (cmd) => {
      if (cmd == 'stop') {
        if (this.intervalHandle != 0) {
          clearInterval(this.intervalHandle)
          this.intervalHandle = 0
        }
      }
      this.getStatus()
    })
  },
  beforeUnmount() {
    if (this.intervalHandle != 0) {
      clearInterval(this.intervalHandle)
      this.intervalHandle = 0
    }
    off('vopidy.track-changed')
    off('player-command')
  },
  methods: {
    getStatus() {
      vopidy('core.status', []).then((res) => {
        if (res.ok) {
          if (res.result.track) {
            //            if (this.intervalHandle == 0) {
            //              this.intervalHandle = setInterval(() => {
            //                this.getStatus()
            //              }, 15000)
            //            }

            this.status = res.result
            if (!this.hasaudio) {
              this.hasaudio = true
              emit('has-audio', true)
            }
            this.ready = true
          } else {
            this.status = { track: { image: '/images/noplay1.webp' } }
            if (this.hasaudio) {
              this.hasaudio = false
              emit('has-audio', false)
            }
            this.ready = true
          }
        }
      })
    },
  },
}
</script>
