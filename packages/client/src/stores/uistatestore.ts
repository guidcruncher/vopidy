import { defineStore } from 'pinia'

export const useUiStateStore = defineStore('uistatestore', {
  state: () => ({
    drawer: false,
    profileImage: '',
    displayMode: 'list',
    locked: false,
    theme: 'dark',
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
    setTheme(t) {
      this.theme = t
    },
    setDrawer(value) {
      this.drawer = value
    },
    setLocked(state) {
      this.locked = state
    },
    toggleDrawer() {
      this.drawer = !this.drawer
    },
  },
  persist: true,
})
