/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from './vuetify'
import { createPinia } from 'pinia'
import router from '../router'
import { createPersistedStatePlugin } from 'pinia-plugin-persistedstate-2'
import { useEventBus } from '@/composables/useeventbus'

// Types
import type { App } from 'vue'

export function registerPlugins(app: App) {
  const pinia = createPinia()
  const persistedStatePlugin = createPersistedStatePlugin({})
  pinia.use(persistedStatePlugin)
  const emitter = useEventBus()
  app.config.globalProperties.emitter = emitter
  app.use(pinia)
  app.use(vuetify).use(router)
}
