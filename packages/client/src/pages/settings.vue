<template>
  <PageTitle title="Settings" />

  <div class="pa-2">
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
    Daytime hours
    <v-range-slider
      v-model="daytime"
      strict
      :min="0"
      :max="23"
      :step="1"
      thumb-label="always"
    ></v-range-slider>
    <v-switch v-model="settings.announceTimeHourly" label="Announce time every hour"></v-switch>
    <v-combobox
      label="Clock Display type"
      v-model="clockType"
      :items="[
        { value: 'analog', title: 'Analog' },
        { value: 'digital', title: 'Digital' },
        { value: 'none', title: 'None' },
      ]"
    ></v-combobox>
  </div>

  <div class="pa-2">
    <table border="0" cellpadding="2" cellspacing="0">
      <tbody>
        <tr>
          <td>
            <img
              src="https://raw.githubusercontent.com/badaix/snapcast/develop/doc/Snapcast.svg"
              style="width: 100px; height: 100px"
            />
          </td>
          <td>&nbsp;</td>
          <td>
            <h3>Snapcast Server</h3>
            <v-switch v-model="settings.enableCast" label="Enable Snapcast server"></v-switch>

<v-select
  label="Audio codec"
  :items="['flac', 'ogg', 'opus', 'pcm']"
  v-model="settings.snapcastCodec"
></v-select>

            <span>
              Please see
              <a target="_new" href="https://github.com/badaix/snapcast"
                >https://github.com/badaix/snapcast</a
              >
              for documentation on Snapcast.
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="pa-2">
    <h3>Delete Bookmarks</h3>
    <Bookmarks mode="editor" />
  </div>
  <div class="pa-2">Version {{ buildVersion.version }}, Built on {{ buildDate }}</div>
  <div class="pa-2">
    <v-btn @click="saveSettings">Save configuration</v-btn>
  </div>
</template>

<script lang="ts" setup>
//
</script>
<script lang="ts">
import { getLocale, getTimezone } from '@/services/locales'
import { vopidy } from '@/services/vopidy'
import buildVersion from '@/version.json'

export default {
  name: 'settings',
  props: {},
  data() {
    return {
      settings: {},
      streamUrl: '',
      iceserver: '',
      clockType: { value: 'none', title: 'None' },
      daytime: [],
      buildDate: '-',
    }
  },
  mounted() {
    this.buildDate = new Intl.DateTimeFormat(this.resolveLocale(), {
      dateStyle: 'short',
      timeStyle: 'long',
    }).format(new Date(parseInt(buildVersion.buildDate) * 1000))
    vopidy('core.config-get', []).then((res) => {
      if (res.ok) {
        this.clockType = res.result.clockType
        this.settings = res.result
        this.daytime = [res.result.nightEndHour ?? 6, res.result.nightStartHour ?? 23]
      }
    })
    this.iceserver = window.location.protocol + '//' + window.location.hostname + ':8000'
    this.streamUrl =
      window.location.protocol + '//' + window.location.hostname + ':8000/audio-stream.m3u'
  },
  beforeUnmount() {},
  methods: {
    resolveLocale() {
      const intl = window.Intl
      if (intl !== undefined) {
        return intl.NumberFormat().resolvedOptions().locale
      }
      const languages = navigator.languages as string[] | undefined
      if (languages !== undefined && languages.length > 0) {
        return languages[0]
      }
      return navigator.language ?? 'en-US'
    },
    saveSettings() {
      vopidy('core.config-get', []).then((res) => {
        let config: any = {}

        if (res.ok) {
          config = res.result
        }
        this.settings.nightStartHour = this.daytime[1]
        this.settings.nightEndHour = this.daytime[0]
        this.settings.timezone = getTimezone()
        this.settings.locale = getLocale()
        this.settings.clockType = this.clockType.title ?? this.settings.clockType
        vopidy('core.config-set', [this.settings]).then((res) => {
          window.location.reload()
        })
      })
    },
  },
}
</script>
