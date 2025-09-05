/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'
import { VopidyEventBus } from '@/services/vopidyeventbus'
import router from './router'

// Components
import App from './App.vue'
import { vopidy } from '@/services/vopidy'

// Composables
import { createApp } from 'vue'

// Stores
import { useUiStateStore } from '@/stores/uistatestore'
import { useConfigStore } from '@/stores/configstore'

// Styles
import 'unfonts.css'
import '@/assets/global.css'

const app = createApp(App)

registerPlugins(app)
VopidyEventBus()

useUiStateStore().setProfileImage()

const configStore = useConfigStore()
await configStore.loadConfig()

app.mount('#app')

if (!localStorage.getItem('vopidy.id')) {
  router.push({ path: '/users' })
} else {
  vopidy('auth.login', localStorage.getItem('vopidy.id')).then((res) => {
    if (localStorage.getItem('page')) {
      let json = JSON.parse(localStorage.getItem('page'))
      router.push({ path: json.path, query: json.query, hash: json.hash })
    }
  })
}
