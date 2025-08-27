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
    <v-list lines="two">
      <v-list-item
        v-for="item in items"
        :key="item.id"
        subtitle=""
        :title="item.name"
        @click="selectItem(item)"
      >
        <template v-slot:prepend>
          <v-avatar color="grey-lighten-1" v-if="item.type != 'radiobrowser'">
            <v-icon color="white">mdi-earth</v-icon>
          </v-avatar>
          <v-avatar color="grey-lighten-1" v-if="item.type == 'radiobrowser'">
            <v-icon color="white">mdi-speaker</v-icon>
          </v-avatar>
        </template>

        <template v-slot:append>
          <v-btn
            color="grey-lighten-1"
            icon="mdi-play"
            variant="text"
            v-if="item.type == 'radiobrowser'"
            @click="selectItem(item)"
          ></v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-sheet>

  <v-sheet v-if="displayMode == 'grid'" ref="el">
    <div class="wrapgrid">
      <div v-for="(item, index) in items" class="cell">
        <center>
          <ScaledImage
            :src="item.image"
            size="lg"
            @click="selectItem(item)"
            v-bind:responsive="false"
          />
          <div class="text-caption" style="height: 40px; overflow: hidden">{{ item.name }}</div>
        </center>
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
import { on, emit, off } from '@/composables/useeventbus'
import { useResizeObserver } from '@vueuse/core'
import { ref, useTemplateRef } from 'vue'
import { useUiStateStore } from '@/stores/uistatestore'
import { storeToRefs } from 'pinia'

const uiStateStore = useUiStateStore()
const { drawer, profileImage, displayMode } = storeToRefs(uiStateStore)

const el = useTemplateRef('el')
useResizeObserver(el, (entries) => {
  const entry = entries[0]
  const { width, height } = entry.contentRect
  let computed = width
  emit('ti-col-change', computed)
})
</script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'

export default {
  name: 'RadioBrowserBrowse',
  props: {},
  data() {
    return { gridwidth: 400, items: [], breadcrumbs: [] }
  },
  mounted() {
    on('ti-col-change', (value) => {
      this.gridwidth = value
    })

    if (this.breadcrumbs.length == 0) {
      this.breadcrumbs.push({ type: '', name: 'By Location', id: '' })
    }
    this.loadItems(this.breadcrumbs[this.breadcrumbs.length - 1])
  },
  beforeUnmount() {
    off('ti-col-change')
  },
  methods: {
    loadItems(item) {
      switch (item.type) {
        case '':
          vopidy('radiobrowser.countries', []).then((res) => {
            if (res.ok) {
              this.items = res.result
            }
          })
          break
        case 'country':
          vopidy('radiobrowser.states', [item.id, item.name]).then((res) => {
            if (res.ok) {
              this.items = res.result
            }
          })
          break
        case 'region':
          vopidy('radiobrowser.browse', [item.name]).then((res) => {
            if (res.ok) {
              this.items = res.result
            }
          })
          break
      }
    },
    loadBreadCrumb(item) {
      let items = []
      const pos = this.breadcrumbs.map((e) => e.id).indexOf(item.id)
      if (pos > 0) {
        items = this.breadcrumbs.slice(0, pos + 1)
        this.breadcrumbs = items
      } else {
        this.breadcrumbs = [{ type: '', name: 'By Location', id: '' }]
      }

      this.loadItems(this.breadcrumbs[this.breadcrumbs.length - 1])
    },
    selectItem(item) {
      if (item.type != 'radiobrowser') {
        this.breadcrumbs.push({ type: item.type, name: item.name, id: item.id })
        this.loadItems(this.breadcrumbs[this.breadcrumbs.length - 1])
      } else {
        vopidy('player.play', ['radiobrowser', item.id]).then((res) => {})
      }
    },
  },
}
</script>
