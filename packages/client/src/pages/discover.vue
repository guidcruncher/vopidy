<template>
  <PageTitle title="Discover" />

  <v-tabs fixed-tabs v-model="tab" bg-color="bg-purple-darken-2" @click="refreshTab()">
    <v-tab value="newreleases">New Releases</v-tab>
    <v-tab value="history">History</v-tab>
    <v-tab value="popular-history">Most listened</v-tab>
  </v-tabs>

  <NewReleases v-if="tab == 'newreleases'" />
  <History v-if="tab == 'history'" />
  <PopularHistory v-if="tab == 'popular-history'" />
</template>

<script lang="ts" setup></script>
<script lang="ts">
export default {
  name: 'Discover',
  props: {},
  data() {
    return { tab: 'newreleases' }
  },
  mounted() {
    if (this.tab) {
      this.refreshTab()
    }
  },
  beforeUnmount() {},
  methods: {
    refreshTab() {},
  },
}
</script>
