import { defineStore } from 'pinia'

export const useSearchStore = defineStore('searchstore', {
  state: () => ({
    page: 1,
    pageSize: 7,
    pageTotal: 0,
    catalog: '',
    query: '',
  }),
  actions: {
    setPage(a, b, c) {
      this.page = a
      this.pageSize = b
      this.pageTotal = c
    },
    setQuery(q) {
      this.query = q
    },
    setCatalog(q) {
      this.catalog = q
    },
  },
  persist: true,
})
