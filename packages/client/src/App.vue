<template>
  <div id="app">
    <v-app>
      <transition name="slide-fade" mode="out-in">
        <router-view></router-view>
      </transition>
    </v-app>
    <Loader v-if="loading" />
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
    return { loading: true }
  },
  mounted() {
    const configStore = useConfigStore()
    configStore.loadConfig().then(() => {
      if (localStorage.getItem('vopidy.id')) {
        useUiStateStore().setProfileImage()
      }
      setTimeout(() => {
        this.loading = false
      }, 3000)
    })
  },
  beforeUnmount() {},
  methods: {},
}
</script>
