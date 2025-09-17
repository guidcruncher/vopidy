<template>
  <PageTitle title="Profiles" />
  <UserProfiles />
</template>
<route lang="yaml">
meta:
  layout: anonlayout
</route>

<script lang="ts" setup>
import { vopidy } from '@/services/vopidy'

vopidy('auth.users', []).then((res) => {
  if (!res || res.length == 0) {
    window.location.href = `${window.location.protocol}//${window.location.host}/api/auth`
  }
})
</script>
<script lang="ts">
export default {
  name: 'Users',
  props: {},
  data() {
    return {}
  },
  mounted() {},
  beforeUnmount() {},
  methods: {
    refreshTab() {},
  },
}
</script>
