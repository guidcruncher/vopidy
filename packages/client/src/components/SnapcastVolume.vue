<template>
  <div class="pa-2">
    <h3>Snapcast Client Volumes</h3>
    <div v-for="item in clients" :key="item.id">
      <v-slider
        min="0"
        max="100"
        show-ticks
        tick-size="1"
        persistent-hint
        step="1"
        thumb-label
        :label="item.config.name"
        v-model="item.config.volume.percent"
        @end="setVolume(item.id, item.config.volume.percent)"
      >
        <template v-slot:prepend>
          <v-btn
            v-if="!item.config.volume.muted"
            icon="mdi-volume-mute"
            variant="outlined"
            density="compact"
            @click="setMute(item.id, true)"
          ></v-btn>
          <v-btn
            v-if="item.config.volume.muted"
            icon="mdi-volume-high"
            variant="outlined"
            density="compact"
            @click="setMute(item.id, false)"
          ></v-btn>
        </template>
      </v-slider>
    </div>
  </div>
</template>
<style></style>
<script lang="ts" setup></script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'

export default {
  name: 'VolumeMixer',
  props: {},
  data() {
    return { clients: [] }
  },
  mounted() {
    vopidy('snapcast.status', []).then((res) => {
      if (res.result.ok) {
        this.clients = res.result.result.server.groups[0].clients
      }
    })
  },
  beforeUnmount() {},
  methods: {
    setMute(id, mute) {
      vopidy('snapcast.setvolume', { id: id, muted: mute, level: undefined }).then((res) => {
        vopidy('snapcast.status', []).then((res) => {
          if (res.result.ok) {
            this.clients = res.result.result.server.groups[0].clients
          }
        })
      })
    },
    setVolume(id, level) {
      vopidy('snapcast.setvolume', { id: id, mute: undefined, level: level }).then((res) => {
        vopidy('snapcast.status', []).then((res) => {
          if (res.result.ok) {
            this.clients = res.result.result.server.groups[0].clients
          }
        })
      })
    },
  },
}
</script>
