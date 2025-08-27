<template>
  <v-layout>
    <v-navigation-drawer
      v-model="drawer"
      class="bg-deep-purple"
      image="/images/55535.webp"
      theme="dark"
      :permanent="windowSize.x > 384"
    >
      <v-list density="compact" item-props :items="items" nav />

      <v-list-item
        class="ma-2"
        link
        nav
        prepend-icon="mdi-cog-outline"
        to="settings"
        title="Settings"
      />
    </v-navigation-drawer>

    <v-app-bar border="b" class="ps-4" flat>
      <v-app-bar-nav-icon @click="uiStateStore.toggleDrawer()" />

      <v-app-bar-title>Vopidy</v-app-bar-title>

      <template #append>
        <v-btn class="text-none me-2" height="48" icon slim>
          <v-avatar color="surface-light" :image="profileImage" size="32" />

          <v-menu activator="parent">
            <v-list density="compact" nav>
              <v-list-item append-icon="mdi-cog-outline" link to="settings" title="Settings" />

              <v-list-item append-icon="mdi-logout" link title="Logout" @click="logout()" />
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
import { useDisplay } from 'vuetify'
import { contents } from '@/router/contents'
import { ref } from 'vue'
import { useUiStateStore } from '@/stores/uistatestore'
import { storeToRefs } from 'pinia'

const display = useDisplay()
const uiStateStore = useUiStateStore()
const { drawer, profileImage, displayMode } = storeToRefs(uiStateStore)

const items = ref(contents)
</script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'
import { on, emit, off } from '@/composables/useeventbus'

export default {
  name: 'layout',
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
