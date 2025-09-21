<template>
  <v-layout>
    <v-navigation-drawer
      v-model="drawer"
      class="bg-deep-purple"
      image="@/assets/images/55535.webp"
      theme="dark"
      :permanent="windowSize.x > 384"
      v-if="!isMobile"
    >
      <div>
        <v-list density="compact" item-props :items="items" nav v-once />
      </div>
    </v-navigation-drawer>

    <v-app-bar border="b" class="ps-4" flat>
      <v-app-bar-nav-icon @click="uiStateStore.toggleDrawer()" v-if="!isMobile" />

      <v-app-bar-title>Vopidy</v-app-bar-title>

      <template #append>
        <v-btn class="text-none me-2" height="48" icon slim>
          <v-avatar color="surface-light" v-once :image="profileImage" size="32" />

          <v-menu activator="parent" v-once>
            <v-list density="compact" item-props :items="items" nav v-once v-if="isMobile" />
            <v-list density="compact" item-props nav v-once>
              <v-list-item prepend-icon="mdi-cog-outline" link to="settings" title="Settings" />
              <v-list-item prepend-icon="mdi-logout" link title="Logout" @click="logout()" />
            </v-list>
          </v-menu>
        </v-btn>
      </template>
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
import { contentsCatalog } from '@/router/contents'
import { useUiStateStore } from '@/stores/uistatestore'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useDisplay } from 'vuetify'

const display = useDisplay()
const uiStateStore = useUiStateStore()
const { drawer, profileImage, displayMode } = storeToRefs(uiStateStore)

const items = ref(contentsCatalog())
</script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'

export default {
  name: 'layout',
  props: {},
  data() {
    return {
      windowSize: { x: 0, y: 300 },
    }
  },
  computed: {
    isMobile() {
      return this.windowSize.x <= 390
    },
  },
  mounted() {
    this.onResize()
  },
  beforeUnmount() {},
  methods: {
    onResize() {
      this.windowSize = { x: window.innerWidth, y: window.innerHeight - 90 }
    },
    logout() {
      vopidy('player.stop', []).then((res) => {
        vopidy('auth.logout', []).then((r) => {
          localStorage.removeItem('vopidy.id')
          localStorage.removeItem('page')
          window.location.href = `${window.location.protocol}//${window.location.host}`
        })
      })
    },
  },
}
</script>
