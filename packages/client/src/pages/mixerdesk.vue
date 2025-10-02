<template>
  <PageTitle title="Mixer Desk" />
  <div class="pa-2">
    <v-btn v-if="!locked" prepend-icon="mdi-lock" variant="outlined" @click="setLockState(true)"
      >Lock</v-btn
    >
    <v-btn
      v-if="locked"
      prepend-icon="mdi-lock-open"
      variant="outlined"
      @click="setLockState(false)"
      >Unlock</v-btn
    >
  </div>
  <Equaliser :locked="locked" />
  <VolumeMixer :locked="locked" />
  <SnapcastVolume :locked="locked" />
</template>

<script lang="ts" setup>
import { useUiStateStore } from '@/stores/uistatestore'
import { storeToRefs } from 'pinia'
const uiStateStore = useUiStateStore()
const { drawer, profileImage, displayMode, locked } = storeToRefs(uiStateStore)
</script>
<script lang="ts">
export default {
  name: 'Mixerdesk',
  props: {},
  data() {
    return {}
  },
  mounted() {},
  beforeUnmount() {},
  methods: {
    setLockState(state) {
      const uiStateStore = useUiStateStore()
      uiStateStore.setLocked(state)
    },
  },
}
</script>
