<template>
  <v-list lines="two">
    <v-list-item
      v-for="item in presets"
      :title="item.title"
      :key="item.fileName"
      @click="loadPreset(item)"
    >
    </v-list-item>
  </v-list>
  <v-slider
    :min="-15"
    :max="15"
    show-ticks
    tick-size="1"
    track-color="green"
    persistent-hint
    step="1"
    thumb-label
    direction="horizontal"
    v-model="gain"
    label="Gain"
    @end="setProp()"
  ></v-slider>

  <v-slider
    :min="-15"
    :max="15"
    label="Delay"
    show-ticks
    tick-size="1"
    track-color="green"
    persistent-hint
    step="1"
    thumb-label
    direction="horizontal"
    v-model="delay"
    @end="setProps()"
  ></v-slider>
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
      delay: 0,
      gain: 1,
    }
  },
  mounted() {
    vopidy('mixer.convolver-list', {}).then((res) => {
      if (res.result) {
        this.presets = res.result
      }
    })
  },
  beforeUnmount() {},
  methods: {
    loadPreset(item) {
      vopidy('mixer.convolver_apply', {
        filename: item.filename,
        gain: this.gain,
        delay: this.delay,
      }).then((res) => {})
    },
    setProps() {
      vopidy('mixer.convolver_applyprops', { gain: this.gain, delay: this.delay }).then((res) => {})
    },
  },
}
</script>
