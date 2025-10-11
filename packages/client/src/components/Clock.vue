<script lang="ts">
import { vopidy } from '@/services/vopidy'

export default {
  name: 'Clock',
  data() {
    return {
      clockType: 'analog',
      ready: false,
    }
  },
  mounted() {
    vopidy('core.config-get', {}).then((res) => {
      if (res.ok) {
        this.clockType = (res.result.clockType ?? 'none').toLowerCase()
        this.ready = true
      }
    })
  },
  beforeUnmount() {},
  methods: {},
}
</script>

<template>
  <div v-if="ready">
    <AnalogClock v-if="clockType == 'analog'" />
    <DigitalClock v-if="clockType == 'digital'" />
  </div>
</template>
