<template>
  <PageTitle title="Settings" />

  <div class="pa-2">
    <table border="0" cellpadding="2" cellspacing="0">
      <tbody>
        <tr>
          <td>
            <img src="/images/bitperfect.webp" style="width: 100px; height: 100px" />
          </td>
          <td>&nbsp;</td>
          <td>
            <h3>BitPerfect Playback</h3>
            <v-switch
              v-model="settings.enableBitPerfectPlayback"
              label="Enable Direct to Hardware playback"
            ></v-switch>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="pa-2">
    <h3>Other Settings</h3>
    <v-switch v-model="settings.enableRequestCache" label="Enable Request Caching"></v-switch>
    <v-number-input
      label="Cache entry lifetime in seconds"
      v-model="settings.requestCacheLifetimeSeconds"
      min="300"
      max="36000"
      :disabled="!settings.enableRequestCache"
    ></v-number-input>
    <v-switch v-model="settings.enableImageCache" label="Enable Image Caching"></v-switch>
    <v-number-input
      label="Maximum image cache age in hours (0=forever)"
      v-model="settings.imageCacheMaxAgeHours"
      min="0"
      max="100"
      :disabled="!settings.enableImageCache"
    ></v-number-input>
  </div>
  <div class="pa-2">
    <table border="0" cellpadding="2" cellspacing="0">
      <tbody>
        <tr>
          <td>
            <a target="_blank" :href="iceserver">
              <img src="/images/icecast.webp" style="width: 100px; height: 100px" />
            </a>
          </td>
          <td>&nbsp;</td>
          <td>
            <h3>Icecast Server</h3>
            <v-switch
              v-model="settings.enableIcecast"
              label="Enable Icecast Streaming Server"
            ></v-switch>
            <span v-if="!settings.alsaLoopbackCapable"
              >ALSA Loopback device needs to be enabled on your host to use this feature.</span
            >
            <span v-if="settings.enableIcecast"
              >Stream URL:<br />
              <a target="_blank" :href="streamUrl">{{ streamUrl }}</a></span
            >
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="pa-2">
    <v-btn @click="saveSettings">Save configuration</v-btn>
  </div>
</template>

<script lang="ts" setup>
//
</script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'
import { on, emit, off } from '@/composables/useeventbus'

export default {
  name: 'settings',
  props: {},
  data() {
    return {
      settings: {},
      streamUrl: '',
      iceserver: '',
    }
  },
  mounted() {
    vopidy('core.config-get', []).then((res) => {
      if (res.ok) {
        this.settings = res.result
      }
    })
    this.iceserver = window.location.protocol + '//' + window.location.hostname + ':8000'
    this.streamUrl =
      window.location.protocol + '//' + window.location.hostname + ':8000/vopidy-stream.m3u'
  },
  beforeUnmount() {},
  methods: {
    saveSettings() {
      vopidy('core.config-get', []).then((res) => {
        let config: any = {}

        if (res.ok) {
          config = res.result
        }

        vopidy('core.config-set', [this.settings]).then((res) => {
          window.location.reload()
        })
      })
    },
  },
}
</script>
