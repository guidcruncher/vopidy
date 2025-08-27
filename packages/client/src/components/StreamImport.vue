<template>
  <div class="pa-2">
    <v-sheet border="dashed md" color="surface-light" rounded="lg">
      <div class="pa-2">
        <v-text-field label="Playlist Name" clearable v-model="name"></v-text-field>
        <v-text-field label="Playlist URL" clearable v-model="url"></v-text-field>
        <v-btn
          :disabled="!(name != '' && url != '')"
          @click="importItems"
          variant="outlined"
          prepend-icon="mdi-upload"
          >Import</v-btn
        >
      </div>
    </v-sheet>
  </div>
</template>
<style>
.v-list {
  height: 90 %;
  overflow-y: auto;
}
</style>
<script lang="ts" setup></script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'

export default {
  name: 'StreamImport',
  props: {},
  data() {
    return { name: '', url: '' }
  },
  mounted() {},
  beforeUnmount() {},
  methods: {
    importItems() {
      vopidy('stream.import', { name: this.name, url: this.url }).then((res) => {
        if (res.ok) {
          this.items = res.result
        }
      })
    },
  },
}
</script>
