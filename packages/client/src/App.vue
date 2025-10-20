<template>
  <div id="app">
    <v-app :theme="theme">
      <router-view></router-view>
    </v-app>
    <Loader v-if="appLoading" />
  </div>
</template>
<script lang="ts" setup>
import { emit, off, on } from '@/composables/useeventbus'

const detectColorScheme = () => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    emit('themechange', 'dark')
  } else {
    emit('themechange', 'light')
  }
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', detectColorScheme)
</script>
<script lang="ts">
import Loader from '@/components/Loader'
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
