<template>
  <div v-cloak class="pa-2">
    <NowPlaying />
    <PlayerControl />
    <VolumeControl />
    <Bookmarks />
  </div>
</template>

<script lang="ts" setup>
//
</script>
<script lang="ts">
export default {
  name: 'Nowplaying',
  props: {},
  data() {
    return {}
  },
  mounted() {},
  beforeUnmount() {},
  methods: {
    refreshTab() {},
  },
}
</script>
