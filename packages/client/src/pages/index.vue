<template>
  <div v-cloak class="pa-2">
    <Clock />
    <NowPlaying />
    <PlayerControl />
    <VolumeControl />
    <Bookmarks />
  </div>
</template>

<script lang="ts" setup></script>

<script lang="ts">
import Bookmarks from '@/components/Bookmarks.vue'
import Clock from '@/components/Clock.vue'
import NowPlaying from '@/components/NowPlaying.vue'
import PlayerControl from '@/components/PlayerControl.vue'
import VolumeControl from '@/components/VolumeControl.vue'

export default {
  components: { Clock, NowPlaying, PlayerControl, VolumeControl, Bookmarks },
  name: 'Index',
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
