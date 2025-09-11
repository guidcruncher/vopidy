/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import { useEventBus } from '@/composables/useeventbus'
import { createPinia } from 'pinia'
import { createPersistedStatePlugin } from 'pinia-plugin-persistedstate-2'
import router from '../router'
import vuetify from './vuetify'

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
