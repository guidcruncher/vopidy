<script lang="ts">
import { ref } from 'vue'

export default {
  name: 'ListItems',
  props: {
    items: {
      type: Array,
      required: true,
      default: [],
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
<template>
  <v-list>
    <v-list-item v-for="item in items" :key="item" :value="item">
      <div class="pa-1" v-ripple>
        <div style="float: left" @click="loadPlaylist(item)">
          <table border="0" cellpadding="0" cellspacing="0">
            <tbody>
              <tr>
                <td>
                  <ScaledImage :src="item.imageUrl" size="xs" style="margin-right: 16px" />
                </td>
                <td>
                  <div class="text-subtitle-1">{{ item.name }}</div>
                  <div class="text-body-2">{{ item.album.name }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="float: right">
          <v-btn icon="mdi-star-plus" @click="addPreset(item.uri)"></v-btn>
        </div>
      </div>
    </v-list-item>
  </v-list>
</template>
<style></style>
