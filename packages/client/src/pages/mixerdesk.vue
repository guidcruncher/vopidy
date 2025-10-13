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
  <v-card>
    <v-tabs v-model="tab">
      <v-tab value="equaliser">Equaliser</v-tab>
      <v-tab value="spatial">Spatial Audio</v-tab>
      <v-tab value="volume">Volume</v-tab>
    </v-tabs>

    <v-card-text>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="equaliser">
          <Equaliser :locked="locked" />
        </v-tabs-window-item>
        <v-tabs-window-item value="spatial">
          <SpatialAudio :locked="locked" />
        </v-tabs-window-item>
        <v-tabs-window-item value="volume">
          <VolumeMixer :locked="locked" />
          <SnapcastVolume :locked="locked" />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>
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
    return { tab: '' }
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
