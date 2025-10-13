<template>
    <v-list lines="two">
      <v-list-item
        v-for="item in presets"
        :title="item.equalizerPresetName"
        :key="item.fileName"
        @click="loadPreset(item)"
      >
      </v-list-item>
    </v-list>
</template>
<style></style>
<script lang="ts" setup></script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'

export default {
  name: 'SpatialAudio',
  props: {
    locked: { type: Boolean, default: false },
  },
  data() {
    return {
      presets: [],
    }
  },
  mounted() {
    vopidy('mixer.equaliser-listpresets', {}).then((res) => {
      if (res.result) {
        this.presets = res.result
      }
    })
  },
  beforeUnmount() {},
  methods: {
  },
}
</script>
