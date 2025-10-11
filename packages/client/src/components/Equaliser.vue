<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn prepend-icon="mdi-sine-wave" v-bind="props" variant="outlined">Presets</v-btn>
    </template>
    <v-list lines="two">
      <v-list-item
        v-for="item in presets"
        :title="item.equalizerPresetName"
        :key="item.fileName"
        @click="loadPreset(item)"
      >
      </v-list-item>
    </v-list>
  </v-menu>
  &nbsp;
  <v-btn
    prepend-icon="mdi-tune-vertical"
    :disabled="locked"
    variant="outlined"
    @click="resetMixer()"
    >Reset</v-btn
  >&nbsp;

  <div class="pa-2" v-if="canMix">
    <div v-if="canMix">
      <v-container v-if="ready">
        <v-row align="start" no-gutters v-for="item in mixer.frequencies" v-if="ready">
          <v-row v-if="item.display">
            <v-col cols="1"
              ><span class="text-no-wrap">{{ item.name }}</span></v-col
            >
            <v-col cols="11">
              <v-slider
                :min="-15"
                :max="15"
                show-ticks
                tick-size="1"
                track-color="green"
                persistent-hint
                :disabled="!canMix || locked"
                step="1"
                thumb-label
                direction="horizontal"
                v-model="item.value"
                @end="setMixer(item)"
              ></v-slider>
            </v-col>
          </v-row>
        </v-row>
      </v-container>
    </div>
    <div class="pa-2" v-if="canMix && mixer.frequencies.length != 0">
      <v-file-input
        clearable
        label="Select presets file"
        accept="application/json"
        v-model="eqfile"
      ></v-file-input>
      &nbsp;
      <v-btn prepend-icon="mdi-upload" variant="outlined" @click="submitPreset(eqfile)"
        >Apply</v-btn
      >
    </div>
  </div>
</template>
<style></style>
<script lang="ts" setup></script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'

export default {
  name: 'Equaliser',
  props: {
    locked: { type: Boolean, default: false },
  },
  data() {
    return {
      presets: [],
      mixer: {},
      canMix: false,
      muted: false,
      ready: false,
      resetLevel: 0,
      preset: {},
      eqfile: {},
    }
  },
  mounted() {
    this.getMixer()
    vopidy('mixer.equaliser-listpresets', {}).then((res) => {
      if (res.result) {
        this.presets = res.result
      }
    })
  },
  beforeUnmount() {},
  methods: {
    showPresets() {},
    loadPreset(item) {
      vopidy('mixer.equaliser-loadpreset', { filename: item.fileName }).then((eqres) => {
        if (eqres.ok == true) {
          vopidy('mixer.equaliser-get', {}).then((res) => {
            if (res.result) {
              this.canMix = true
              this.mixer = { frequencies: res.result }
              this.ready = true
            }
          })
        }
      })
    },
    submitPreset(file) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        const text = JSON.stringify(reader.result)

        vopidy('mixer.equaliser-setpreset', { json: text }).then((eqres) => {
          if (eqres.ok == true) {
            vopidy('mixer.equaliser-get', {}).then((res) => {
              if (res.result) {
                this.canMix = true
                this.mixer = { frequencies: res.result }
                this.ready = true
              }
            })
          }
        })
      })

      reader.readAsText(this.eqfile)
    },
    getMixer() {
      vopidy('mixer.equaliser-get', {}).then((res) => {
        if (res.result) {
          this.canMix = true
          this.mixer = { frequencies: res.result }
          this.ready = true
        } else {
          thils.canMix = false
        }
      })
    },
    setMixer(item) {
      vopidy('mixer.equaliser-set', { value: item }).then((res) => {
        if (res.ok) {
        }
      })
    },
    resetMixer() {
      let value = 0
      vopidy('mixer.equaliser-reset', { value: value }).then((res) => {
        if (res.ok) {
          this.getMixer()
        }
      })
    },
  },
}
</script>
