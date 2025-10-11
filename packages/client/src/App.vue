<template>
  <div id="app">
    <v-app :theme="theme">
      <router-view></router-view>
    </v-app>
    <Loader v-if="appLoading" />
  </div>
</template>

<script lang="ts" setup>
//
</script>
<script lang="ts">
import Loader from '@/components/Loader'
import { off, on } from '@/composables/useeventbus'
import { useConfigStore } from '@/stores/configstore'
import { useUiStateStore } from '@/stores/uistatestore'

export default {
  name: 'App',
  props: {},
  data() {
    return { appLoading: true, theme: 'light' }
  },
  mounted() {
    this.theme = useUiStateStore().theme
    const configStore = useConfigStore()
    configStore.loadConfig().then(() => {
      if (localStorage.getItem('vopidy.id')) {
        useUiStateStore().setProfileImage()
      }
      this.appLoading = false
    })
    on('themechange', (t) => {
      this.theme = t
      useUiStateStore().setTheme(t)
    })
  },
  beforeUnmount() {
    off('themechamge')
  },
  methods: {},
}
</script>
