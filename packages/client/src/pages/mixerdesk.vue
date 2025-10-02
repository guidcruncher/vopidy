<template>
  <PageTitle title="Mixer Desk" />
  <v-btn v-if="!locked" prependicon="mdi-lock" variant="outlined" @click="setLockState(true)"
    >Lock</v-btn
  >
  <v-btn v-if="locked" prependicon="mdi-lock-open" variant="outlined" @click="setLockState(false)"
    >Unlock</v-btn
  >
  <Equaliser :locked="locked" />
  <VolumeMixer :locked="locked" />
  <SnapcastVolume :locked="locked" />
</template>

<script lang="ts" setup>
//
</script>
<script lang="ts">
export default {
  name: 'Mixerdesk',
  props: {},
  data() {
    return { locked: true }
  },
  mounted() {
    const store = useUIStateStore()
    this.locked = store.locked
  },
  beforeUnmount() {},
  methods: {
    setLockState(state) {
      const store = useUIStateStore()
      this.locked = state
      store.setLocked(state)
    },
  },
}
</script>
