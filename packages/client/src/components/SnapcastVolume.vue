<template>
  <div class="pa-2">
    <h3>Snapcast Client Volume</h3>
    <v-sheet v-for="group in groups" class="pa-2 rounded" border="primary">
      {{ group.name }}
      <div v-for="item in group.clients" :key="item.id">
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
          :disabled="!item.connected"
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
    </v-sheet>
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
    return { groups: [] }
  },
  mounted() {
    this.getStatus()

    on('vopidy.snapcast.client.onconnect', (data) => {
      this.getStatus()
    })
    on('vopidy.snapcast.client.ondisconnect', (data) => {
      this.getStatus()
    })
    on('vopidy.snapcast.client.onvolumechanged', (data) => {
      this.getStatus()
    })
    on('vopidy.snapcast.client.onnamechanged', (data) => {
      this.getStatus()
    })
    on('vopidy.snapcast.group.onnamechanged', (data) => {
      this.getStatus()
    })
  },
  beforeUnmount() {
    off('vopidy.snapcast.client.onconnect')
    off('vopidy.snapcast.client.ondisconnect')
    off('vopidy.snapcast.client.onvolumechanged')
    off('vopidy.snapcast.client.onnamechanged')
    off('vopidy.snapcast.group.onnamechanged')
  },
  methods: {
    getStatus() {
      vopidy('snapcast.status', {}).then((res) => {
        if (res.result) {
          this.groups = res.result.server.groups
        }
      })
    },
    setMute(id, mute) {
      vopidy('snapcast.setvolume', { id: id, muted: mute, level: undefined }).then((res) => {
        this.getStatus()
      })
    },
    setVolume(id, level) {
      vopidy('snapcast.setvolume', { id: id, mute: undefined, level: level }).then((res) => {
        this.getStatus()
      })
    },
  },
}
</script>
