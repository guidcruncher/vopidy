<template>
  <center>
    <ScaledImage :src="status.track.image" size="xxl" padding="5" @click="viewDetail()" />
    <h2 v-if="status.track">{{ status.track.name }}</h2>
    <h3 v-if="status.track && status.track.nowplaying">
      {{ status.track.nowplaying.streamTitle }}
    </h3>
    <h3 v-if="!status.track && status.track.album">{{ status.track.album }}</h3>
    <h4 v-if="status.track.artist">
      <ArtistNames v-if="status.track.artist" :artists="status.track.artist" />
    </h4>
    <v-slider
      max-width="270"
      @end="performSeek"
      v-if="position.duration != 0"
      min="0"
      step="1"
      thumb-label
      :max="position.duration"
      v-model="position.progress"
    >
      <template v-slot:prepend>
        <span class="text-caption">{{ progressTimestamp }}</span>
      </template>
      <template v-slot:append>
        <span class="text-caption">{{ remainingTimestamp }}</span>
      </template></v-slider
    >
  </center>

  <SpotifyItemDetail />
</template>
<style></style>
<script lang="ts" setup></script>
<script lang="ts">
import { emit, off, on } from '@/composables/useeventbus'
import { vopidy } from '@/services/vopidy'

export default {
  name: 'NowPlaying',
  props: {},
  data() {
    return {
      hasaudio: false,
      intervalHandle: 0,
      paused: false,
      position: { duration: 0, progress: 0 },
      status: { track: { image: '/images/noplay1.webp', nowplaying: { streamTitle: '' } } },
      ready: false,
    }
  },
  computed: {
    progressTimestamp() {
      if (!this.position || !this.position.progress || this.position.progress <= 0) {
        return ''
      }
      const dte = new Date(null)
      dte.setSeconds(this.position.progress)
      if (this.position.duration > 3600) {
        return dte.toISOString().slice(11, 19)
      }
      return dte.toISOString().slice(14, 19)
    },
    remainingTimestamp() {
      if (!this.position || !this.position.progress || this.position.progress <= 0) {
        return ''
      }
      const dte = new Date(null)
      dte.setSeconds(this.position.duration - this.position.progress)
      if (this.position.duration > 3600) {
        return dte.toISOString().slice(11, 19)
      }
      return dte.toISOString().slice(14, 19)
    },
  },
  mounted() {
    this.getStatus(() => {
      if (this.intervalHandle == 0) {
        this.intervalHandle = setInterval(() => {
          if (!this.status.paused) {
            if (this.position.duration > 0) {
              if (this.position.progress < this.position.duration) {
                this.position.progress += 1
              } else {
                this.position.progress = this.position.duration
              }
            }
          }
        }, 1000)
      }
    })
    on('vopidy.streamtitle-changed', (meta) => {
      if (this.status) {
        this.status.meta = meta
      }
    })

    on('vopidy.track-changed', () => {
      this.position = { duration: 0, progress: 0 }
      this.getStatus(() => {
        if (this.status.position) {
          if (this.intervalHandle == 0) {
            this.intervalHandle = setInterval(() => {
              if (!this.status.paused && this.status.playing) {
                if (this.position.duration > 0) {
                  if (this.position.progress < this.position.duration) {
                    this.position.progress += 1
                  } else {
                    this.position.progress = this.position.duration
                  }
                }
              }
            }, 1000)
          }
        } else {
          if (this.intervalHandle != 0) {
            clearInterval(this.intervalHandle)
            this.intervalHandle = 0
          }
        }
      })
    })
    on('player-command', (cmd) => {
      if (cmd == 'stop') {
        if (this.intervalHandle != 0) {
          clearInterval(this.intervalHandle)
          this.intervalHandle = 0
        }
      }

      this.getStatus(() => {})
    })
  },
  beforeUnmount() {
    if (this.intervalHandle != 0) {
      clearInterval(this.intervalHandle)
      this.intervalHandle = 0
    }
    off('vopidy.track-changed')
    off('vopidy.streamtitle-changed')
    off('player-command')
  },
  methods: {
    viewDetail() {
      if (this.status.track) {
        switch (this.status.source) {
          case 'spotify':
            if (this.status.track.context) {
              emit('showitemdetail', this.status.track.context)
            }
            break
        }
      }
    },
    performSeek(position) {
      if (this.status && this.status.source) {
        vopidy('player.seek', [this.status.source, Math.ceil(position)]).then((res) => {
          if (!res.ok) {
          }
        })
      }
    },
    getStatus(cb) {
      vopidy('core.status', []).then((res) => {
        if (res.ok) {
          this.paused = res.result.paused
          if (res.result.position) {
            this.position = {
              duration: Math.ceil(res.result.position.duration / 1000),
              progress:
                res.result.position.progress < 0
                  ? 0
                  : Math.ceil(res.result.position.progress / 1000),
            }
          } else {
            this.position = { duration: 0, progress: 0 }
          }

          if (res.result.track) {
            this.status = res.result
            if (!this.hasaudio) {
              this.hasaudio = true
              emit('has-audio', true)
            }
            this.ready = true
          } else {
            this.position = { duration: 0, progress: 0 }
            this.status = { track: { image: '/images/noplay1.webp' } }
            if (this.hasaudio) {
              this.hasaudio = false
              emit('has-audio', false)
            }
            this.ready = true
          }
        }

        if (cb) {
          cb()
        }
      })
    },
  },
}
</script>
