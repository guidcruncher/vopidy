<template>
  <PageTitle title="Settings" />
  <v-card>
    <v-tabs v-model="tab">
      <v-tab value="system">System</v-tab>
      <v-tab value="clock">Clock</v-tab>
      <v-tab value="snapcast">Snapcast</v-tab>
      <v-tab value="bookmarks">Bookmarks</v-tab>
    </v-tabs>
    <v-card-text class="bg-surface-light pt-4">
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="system">
          <div class="pa-2">
            <h3>System</h3>
            <v-switch
              v-model="settings.enableRequestCache"
              label="Enable Request Caching"
            ></v-switch>
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
        </v-tabs-window-item>
        <v-tabs-window-item value="clock">
          <div class="pa-2">
            <h3>Clock</h3>
            Daytime hours
            <v-range-slider
              v-model="daytime"
              strict
              :min="0"
              :max="23"
              :step="1"
              thumb-label="always"
            ></v-range-slider>
            <v-switch
              v-model="settings.announceTimeHourly"
              label="Announce time every hour"
            ></v-switch>
            <v-select
              label="Display type"
              v-model="clockType"
              :items="[
                { value: 'analog', title: 'Analog' },
                { value: 'digital', title: 'Digital' },
                { value: 'none', title: 'None' },
              ]"
            />
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="snapcast">
          <div class="pa-2">
            <h3>Snapcast</h3>
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
                      for documentation on Snapcast.<br /><br/>
Changes will not take affect until the Container is restarted.
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="bookmarks">
          <div class="pa-2">
            <h3>Delete Bookmarks</h3>
            <Bookmarks mode="editor" />
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
      <v-divider class="border-opacity-75"></v-divider>
      <div class="pa-2">Version {{ buildVersion.version }}, Built on {{ buildDate }}</div>
    </v-card-text>
    <v-card-actions>
      <v-btn variant="outlined" @click="saveSettings">Save configuration</v-btn>
    </v-card-actions>
  </v-card>
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
      tab: 'system',
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
