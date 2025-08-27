import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUiStateStore = defineStore('uistatestore', {
  state: () => ({
    drawer: false,
    profileImage: '',
    displayMode: 'list',
  }),
  actions: {
    setProfileImage() {
      return fetch('/api/auth/profile').then((res) => {
        if (res.ok) {
          return res.json().then((json) => {
            this.profileImage = json.images[0].url
            return this.profileImage
          })
        }
      })
    },
    setDisplayMode(mode) {
      this.displayMode = mode
    },
    setDrawer(value) {
      this.drawer = value
    },
    toggleDrawer() {
      this.drawer = !this.drawer
    },
  },
  persist: true,
})
