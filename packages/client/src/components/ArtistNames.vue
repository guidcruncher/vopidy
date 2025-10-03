<script lang="ts">
export default {
  name: 'ArtistNames',
  props: {
    artists: {
      type: Array,
      required: true,
    },
    variant: {
      type: String,
      default: 'pill',
    },
  },
  data() {
    return { selectedId: '', showInfo: false }
  },
  computed: {
    getArtists() {
      if (!this.artists) {
        return ''
      }

      if (Array.isArray(this.artists)) {
        return this.artists.filter((a) => {
          if (a.name) {
            if (a.name.trim() != '') {
              return { id: a.id, name: a.name.trim() }
            }
          } else {
            if (a.trim() != '') {
              return { id: '', name: a.trim() }
            }
          }
        })
      }
      return [{ name: this.artists.trim(), id: '' }]
    },
  },
  mounted() {},
  beforeUnmount() {},
  methods: {
    artistInfo(item) {
      this.selectedId = 'spotify:artist:' + item.id
      this.showInfo = true
    },
  },
}
</script>
<template>
  <span v-if="variant == 'text'" v-for="(item, index) in getArtists"
    ><span v-if="item.name.trim() != ''"
      >{{ item.name }}<span v-if="index < artists.length - 1">, </span></span
    ></span
  >
  <span v-if="variant == 'pill'">
    <v-chip @click="artistInfo(item)" v-for="(item, index) in getArtists">
      {{ item.name }}
    </v-chip>
  </span>

  <SpotifyArtist :show="showInfo" :id="selectedId" />
</template>
<style></style>
