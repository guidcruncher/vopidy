<template>
  <v-layout>
    <v-app-bar border="b" class="ps-4" flat>
      <v-app-bar-nav-icon />
      <v-app-bar-title>Vopidy</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <div class="pa-4">
        <v-sheet border="dashed md" color="surface-light" rounded="lg" width="100%">
          <router-view />
        </v-sheet>
      </div>
    </v-main>
  </v-layout>
</template>

<script lang="ts" setup>
import { useDisplay } from 'vuetify'
import { ref } from 'vue'
import { useUiStateStore } from '@/stores/uistatestore'
import { storeToRefs } from 'pinia'

const display = useDisplay()
const uiStateStore = useUiStateStore()
const { drawer, profileImage } = storeToRefs(uiStateStore)
</script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'
import { on, emit, off } from '@/composables/useeventbus'

export default {
  name: 'anonlayout',
  props: {},
  data() {
    return {
      windowSize: { x: 0, y: 300 },
    }
  },
  mounted() {
    this.onResize()
  },
  beforeUnmount() {},
  methods: {
    onResize() {
      this.windowSize = { x: window.innerWidth, y: window.innerHeight - 90 }
    },
  },
}
</script>
