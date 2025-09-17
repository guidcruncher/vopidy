import { vopidyhttp } from '@/services/vopidyhttp'
import { defineStore } from 'pinia'

export const useConfigStore = defineStore('configstore', {
  state: () => ({
    config: {},
  }),
  actions: {
    getConfig() {
      return this.config
    },
    setConfig(config) {
      this.config = config
    },
    loadConfig() {
      return vopidyhttp('core.config-get', []).then((res) => {
        if (res.ok) {
          this.config = res.result
        }
      })
    },
  },
  persist: true,
})
