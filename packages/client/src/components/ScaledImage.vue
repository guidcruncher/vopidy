<script lang="ts">
const sizes = {
  xs: 64,
  sm: 80,
  md: 100,
  lg: 150,
  xl: 200,
  xxl: 250,
  xxxl: 300,
}
export default {
  name: 'ScaledImage',
  props: {
    src: {
      type: String,
      required: true,
      default: '/images/noimage.webp',
    },
    padding: {
      type: String,
      default: '2',
      required: false,
    },
    size: {
      type: String,
      required: true,
    },
    border: {
      type: String,
      required: false,
      default: 'rounded',
    },
    matchbackground: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      pixelSize: '',
      derivedSize: '',
      derivedClass: '',
      derivedPadding: 'padding:1px',
      ready: false,
    }
  },
  mounted() {
    this.pixelSize = (parseInt(this.padding) * 2 + sizes[this.size]).toString() + 'px'
    this.derivedPadding = this.padding + 'px'
    this.derivedSize = 'scaled-img-' + this.size
    this.derivedClass = 'scaled-img scaled-img-' + this.size + ' '
  },
  beforeUnmount() {},
  methods: {
    proxy(url: string) {
      this.ready = true
      let requrl = url

      if (!url || url === '') {
        requrl = '/images/noimage.webp'
      }

      const params = new URLSearchParams()
      params.append('u', encodeURIComponent(window.btoa(requrl.toString())))
      params.append('s', this.pixelSize.toString())
      return '/api/p?' + params.toString()
    },
  },
}
</script>
<template>
  <div :class="border" :style="{ width: pixelSize, height: pixelSize, padding: derivedPadding }">
    <div :class="derivedClass"><span /><img :src="proxy(src)" v-show="ready" /></div>
  </div>
</template>
<style></style>
