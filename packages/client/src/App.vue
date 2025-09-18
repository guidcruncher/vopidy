<template>
  <div id="app">
    <v-app>
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
import { useConfigStore } from '@/stores/configstore'
import { useUiStateStore } from '@/stores/uistatestore'

export default {
  name: 'App',
  props: {},
  data() {
    return { appLoading: true }
  },
  mounted() {
    const configStore = useConfigStore()
    configStore.loadConfig().then(() => {
      if (localStorage.getItem('vopidy.id')) {
        useUiStateStore().setProfileImage()
      }
      setTimeout(() => {
        this.appLoading = false
      }, 3000)
    })
  },
  beforeUnmount() {},
  methods: {},
}
</script>
