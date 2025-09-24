<template>
  <center>
    <table border="0" cellpadding="4" cellspacing="4">
      <tbody>
        <tr>
          <td>
            <v-btn
              color="deep-purple-darken-4"
              icon="mdi-skip-previous"
              @click="playerOp('previous')"
            />
          </td>
          <td>
            <v-btn color="deep-purple-darken-4" icon="mdi-stop" @click="playerOp('stop')" />
          </td>
          <td>
            <v-btn
              color="deep-purple-darken-4"
              size="x-large"
              icon="mdi-play"
              v-if="!playing || paused"
              @click="playerOp('resume')"
            />
            <v-btn
              color="deep-purple-darken-4"
              size="x-large"
              icon="mdi-pause"
              v-if="playing && !paused"
              @click="playerOp('pause')"
            />
          </td>
          <td>
            <v-btn color="deep-purple-darken-4" icon="mdi-skip-next" @click="playerOp('next')" />
          </td>
          <td>
            <v-btn
              color="deep-purple-darken-4"
              icon="mdi-bookmark-plus-outline"
              :disabled="!hastrack"
              @click="addBookmark()"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </center>
</template>
<style></style>
<script lang="ts" setup></script>
<script lang="ts">
import { emit, off, on } from '@/composables/useeventbus'
import { vopidy } from '@/services/vopidy'

export default {
  name: 'PlayerControl',
  props: {},
  data() {
    return {
      status: {},
      hastrack: false,
      ready: false,
      playing: false,
      paused: false,
      muted: false,
    }
  },
  mounted() {
    this.getStatus()
    on('vopidy.track-changed', () => {
      this.getStatus()
    })
  },
  beforeUnmount() {
    off('vopidy.track-changed')
  },
  methods: {
    addBookmark() {
      vopidy('core.status', []).then((res) => {
        if (res.ok) {
          if (res.result.track) {
            this.status = res.result
            this.playing = res.result.playing
            this.paused = res.result.paused
            this.muted = res.result.muted
            this.ready = true
            vopidy(`bookmarks.create`, {
              source: this.status.source,
              item: this.status.track,
            }).then((res) => {
              if (res.ok) {
                emit('vopidy.add-bookmark')
              }
            })
          } else {
          }
        }
      })
    },
    playerOp(method) {
      vopidy(`player.${method}`, []).then((res) => {
        emit('player-command', { command: method })
        vopidy('core.status', []).then((res) => {
          if (res.ok) {
            if (res.result.track) {
              this.status = res.result
              this.playing = res.result.playing
              this.paused = res.result.paused
              this.muted = res.result.muted
              this.ready = true
            } else {
            }
          }
        })
      })
    },
    mixerOp(method) {
      vopidy(`mixer.${method}`, []).then((res) => {
        emit('mixer-command', { command: method })
        this.getStatus()
      })
    },
    getStatus() {
      vopidy('core.status', []).then((res) => {
        if (res.ok) {
          this.muted = res.result.muted
          if (res.result.track) {
            this.hastrack = true
            this.status = res.result
            this.playing = res.result.playing
            this.paused = res.result.paused
            this.muted = res.result.muted
            this.ready = true
          } else {
            this.status = undefined
            this.ready = false
            this.hastrack = false
          }
        } else {
          this.hastrack = false
        }
      })
    },
  },
}
</script>
