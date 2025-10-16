<template>
  <div>
    <div class="pa-1">
      <v-chip @click="loadBreadCrumb(item)" class="ma-1" v-for="item in breadcrumbs">{{
        item.name
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
    <div :style="{ 'overflow-y': 'scroll', height: size.height }">
      <v-list lines="two">
        <v-list-item
          v-for="item in items"
          :key="item.id"
          :subtitle="item.artist"
          :title="item.name"
          @click="selectItem(item)"
        >
          <template v-slot:prepend>
            <v-avatar color="grey-lighten-1" v-if="item.itemType == 'dir'">
              <v-icon color="white">mdi-folder</v-icon>
            </v-avatar>
            <v-avatar color="grey-lighten-1" v-if="item.itemType == 'file'">
              <v-icon color="white">mdi-speaker</v-icon>
            </v-avatar>
          </template>

          <template v-slot:append>
            <v-btn
              color="grey-lighten-1"
              icon="mdi-play"
              variant="text"
              v-if="item.itemType == 'file'"
              @click="selectItem(item)"
            ></v-btn>
          </template>
        </v-list-item>
      </v-list>
    </div>
  </v-sheet>

  <v-sheet v-if="displayMode == 'grid'" ref="el">
    <div :style="{ 'overflow-y': 'scroll', height: size.height }">
      <div class="wrapgrid">
        <div v-for="(item, index) in items" class="cell">
          <center>
            <img
              src="/images/foldericon.webp"
              style="width: 150px; height: 150px"
              @click="selectItem(item)"
              v-if="item.itemType == 'dir'"
            />
           <img
              src="/images/noimage.webp"
              style="width: 150px; height: 150px"
              @click="selectItem(item)"
              v-if="item.itemType == 'file'"
            />
            <div
              @click="selectItem(item)"
              class="text-caption"
              style="height: 40px; overflow: hidden"
            >
              {{ item.name }}
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
  width: v-bind('gridwidth');
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
import { emit, off, on } from '@/composables/useeventbus'
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
  name: 'FileBrowse',
  props: {},
  data() {
    return {
      gridwidth: 400,
      dir: '.',
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
      this.breadcrumbs.push({ name: '.', itemType: 'dir', filename: '.' })
    }

    this.loadItems(this.dir)
  },
  beforeUnmount() {
    off('resized')
  },
  methods: {
    loadBreadCrumb(item) {
      let items = []
      const pos = this.breadcrumbs.map((e) => e.id).indexOf(item.id)
      if (pos > 0) {
        items = this.breadcrumbs.slice(0, pos + 1)
        this.breadcrumbs = items
      } else {
        this.breadcrumbs = [{ name: '.', itemType: 'dir', filename: '.' }]
      }

      const dir = this.breadcrumbs.map((t) => t.filename).join('/')
      this.loadItems(dir)
    },
    loadItems(dir) {
      vopidy('library.browse', { dir: dir }).then((res) => {
        if (res.ok) {
          this.dir = res.result.dir
          this.items = res.result.items
        }
      })
    },
    selectItem(item) {
      switch (item.itemType) {
        case 'dir':
          this.breadcrumbs.push({
            name: item.name,
            filename: item.filename,
            itemType: 'dir',
            id: item.id,
          })
          this.loadItems(`${item.filename}`)
          break
        case 'file':
          const dir = this.breadcrumbs.map((t) => t.name + '/')
          vopidy('player.play', { source: 'library', id: item.id }).then((res) => {
            emit('vopidy.track-changed')
            emit('snackbar', { text: 'Playback started.' })
          })
          break
      }
    },
  },
}
</script>
