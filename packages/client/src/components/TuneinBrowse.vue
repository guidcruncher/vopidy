<template>
  <div>
    <div class="pa-1">
      <v-chip @click="loadBreadCrumb(item)" class="ma-1" v-for="item in breadcrumbs">{{
        item.text
      }}</v-chip>
    </div>
    <div class="pa-1">
      <v-chip
        class="ma-1"
        v-if="displayMode == 'grid'"
        prepend-icon="mdi-view-list"
        @click="displayMode = 'list'"
        >List view</v-chip
      >
      <v-chip
        class="ma-1"
        v-if="displayMode == 'list'"
        prepend-icon="mdi-view-grid"
        @click="displayMode = 'grid'"
        >Grid view</v-chip
      >
    </div>
  </div>
  <v-sheet v-if="displayMode == 'list'">
    <v-list lines="two">
      <v-list-item
        v-for="item in items"
        :key="item.id"
        :subtitle="item.text"
        :title="item.text"
        @click="selectItem(item)"
      >
        <template v-slot:prepend>
          <v-avatar color="grey-lighten-1" v-if="item.type == 'link'">
            <v-icon color="white">mdi-earth</v-icon>
          </v-avatar>
          <v-avatar color="grey-lighten-1" v-if="item.type == 'audio'">
            <v-icon color="white">mdi-speaker</v-icon>
          </v-avatar>
        </template>

        <template v-slot:append>
          <v-btn
            color="grey-lighten-1"
            icon="mdi-play"
            variant="text"
            v-if="item.type == 'audio'"
            @click="selectItem(item)"
          ></v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-sheet>

  <v-sheet v-if="displayMode == 'grid'" ref="el">
    <div :style="{ 'overflow-y': 'scroll', height: size.height }">
      <div class="wrapgrid">
        <div v-for="(item, index) in items" class="cell">
          <center>
            <img
              src="/images/radiogroup.webp"
              style="width: 150px; height: 150px"
              @click="selectItem(item)"
              v-if="item.type == 'link'"
            />
            <ScaledImage
              :src="item.image"
              size="lg"
              @click="selectItem(item)"
              v-if="item.type == 'audio'"
              v-bind:responsive="false"
            />
            <div
              @click="selectItem(item)"
              class="text-caption"
              style="height: 40px; overflow: hidden"
            >
              {{ item.text }}
            </div>
          </center>
        </div>
      </div>
    </div>
  </v-sheet>
</template>
<style>
.wrapgrid {
  display: block;
  width: v-bind('size.width');
  position: relative;
}
.cell {
  display: inline-block;
  position: relative;
  width: 150px;
  height: 150px;
  margin: 3px;
}
.v-list {
  height: 90 %;
  overflow-y: auto;
}
</style>
<script lang="ts" setup>
import { off, on } from '@/composables/useeventbus'
import { useResizer } from '@/composables/useresizer'
import { useUiStateStore } from '@/stores/uistatestore'
import { storeToRefs } from 'pinia'
import { useTemplateRef } from 'vue'
const uiStateStore = useUiStateStore()
const { drawer, profileImage, displayMode } = storeToRefs(uiStateStore)

const el = useTemplateRef('el')
const { a, b, c } = useResizer(el, 250)
</script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'

export default {
  name: 'TuneinBrowse',
  props: {},
  data() {
    return {
      cols: 4,
      gridwidth: 400,
      items: [],
      breadcrumbs: [],
      size: { width: '100%', height: '100%' },
    }
  },
  mounted() {
    on('resized', (prop) => {
      this.cols = prop.cols
      this.size = prop.size
    })

    if (this.breadcrumbs.length == 0) {
      this.breadcrumbs.push({ text: 'By Location', type: 'link', id: 'r0' })
    }
    this.loadItems(this.breadcrumbs[this.breadcrumbs.length - 1].id)
  },
  beforeUnmount() {
    off('resized')
  },
  methods: {
    loadItems(id) {
      vopidy('tunein.browse', [id]).then((res) => {
        if (res.ok) {
          this.items = res.result
        }
      })
    },
    loadBreadCrumb(item) {
      let items = []
      const pos = this.breadcrumbs.map((e) => e.id).indexOf(item.id)
      if (pos > 0) {
        items = this.breadcrumbs.slice(0, pos + 1)
        this.breadcrumbs = items
      } else {
        this.breadcrumbs = [{ text: 'By Location', type: 'link', id: 'r0' }]
      }

      this.loadItems(this.breadcrumbs[this.breadcrumbs.length - 1].id)
    },
    selectItem(item) {
      switch (item.type) {
        case 'link':
          this.breadcrumbs.push({ text: item.text, type: item.type, id: item.id })
          this.loadItems(this.breadcrumbs[this.breadcrumbs.length - 1].id)
          break
        case 'audio':
          vopidy('player.play', ['tunein', item.id]).then((res) => {})
          break
      }
    },
  },
}
</script>
