<template>
  <v-toolbar v-once class="text-white" image="/images/masthead.webp">
    <v-toolbar-title :text="title"></v-toolbar-title>
  </v-toolbar>
</template>
<style></style>
<script lang="ts" setup></script>
<script lang="ts">
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
