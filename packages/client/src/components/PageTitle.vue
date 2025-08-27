<template>
  <v-toolbar class="text-white" image="/images/masthead.webp">
    <v-toolbar-title :text="title"></v-toolbar-title>
  </v-toolbar>
</template>
<style></style>
<script lang="ts" setup></script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'
import { on, emit, off } from '@/composables/useeventbus'

export default {
  name: 'PageTitle',
  props: {
    title: {
      type: String,
      required: true,
      default: '',
    },
  },
  data() {
    return {}
  },
  mounted() {},
  beforeUnmount() {},
  methods: {},
}
</script>
