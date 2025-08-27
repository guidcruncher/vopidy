<template>
  <div>
    <center>
      <div v-if="canMix" style="width: 470px">
        <v-container v-if="ready">
          <v-row align="start" no-gutters>
            <v-col v-for="item in mixer.frequencies" v-if="ready">
              <v-slider
                :min="item.min"
                :max="item.max"
                show-ticks
                tick-size="1"
                persistent-hint
                max-width="250"
                :disabled="!canMix"
                step="1"
                thumb-label
                direction="vertical"
                v-model="item.value"
                @end="setMixer"
              ></v-slider>
              <span class="text-caption" style="writing-mode: vertical-rl">{{ item.name }}</span>
            </v-col>
          </v-row>
        </v-container>
      </div>
      <div class="pa-2" v-if="canMix">
        <table border="0" cellpadding="5" cellspacing="0">
          <tbody>
            <tr>
              <td>
                <v-number-input
                  :reverse="false"
                  controlVariant="split"
                  label="Reset level to"
                  :hideInput="false"
                  :inset="false"
                  v-model="resetLevel"
                  style="width: 170px"
                ></v-number-input>
              </td>
              <td>&nbsp;</td>
              <td valign="Middle">
                <v-btn prepend-icon="mdi-tune-vertical" variant="outlined" @click="resetMixer()"
                  >Reset Levels</v-btn
                >&nbsp;
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </center>
  </div>
</template>
<style></style>
<script lang="ts" setup></script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'
import { on, emit, off } from '@/composables/useeventbus'

export default {
  name: 'Equaliser',
  props: {},
  data() {
    return { mixer: {}, canMix: false, muted: false, ready: false, resetLevel: 66 }
  },
  mounted() {
    vopidy('core.config-get', []).then((res) => {
      if (res.ok) {
        this.canMix = !(res.result.enableBitPerfectPlayback === 'true')
        if (this.canMix) {
          this.getMixer()
        }
      }
    })
  },
  beforeUnmount() {},
  methods: {
    getMixer() {
      vopidy('mixer.equaliser.get', []).then((res) => {
        if (res.ok) {
          this.mixer = res.result
          this.ready = true
        }
      })
    },
    setMixer() {
      vopidy('mixer.equaliser.set', [this.mixer]).then((res) => {
        if (res.ok) {
        }
      })
    },
    resetMixer() {
      let value = parseInt(this.resetLevel.toString())
      vopidy('mixer.equaliser.reset', [value]).then((res) => {
        if (res.ok) {
          this.getMixer()
        }
      })
    },
  },
}
</script>
