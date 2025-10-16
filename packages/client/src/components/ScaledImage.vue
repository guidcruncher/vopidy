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
      if (!url || url === '') {
        return '/images/noimage.webp'
      }

      if (!url.startsWith('http')) {
        return url
      }
      let u = new URL(url)
      if (u.hostname == window.location.hostname) {
        return url
      }
      const params = new URLSearchParams()
      params.append('u', encodeURIComponent(window.btoa(url)))
return url
      return '/api/p?' + params.toString()
    },
    setBgColor(ev: Event) {
      const rgbToHex = function (r: number, g: number, b: number) {
        if (r > 255 || g > 255 || b > 255) {
          return ''
        }

        return ((r << 16) | (g << 8) | b).toString(16)
      }

      const srcImg = ev.target as HTMLImageElement
      const target = srcImg ? srcImg.parentElement.parentElement : null
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(srcImg, 0, 0)
        const p = ctx.getImageData(0, 0, 1, 1).data
        let hex = '#' + ('000000' + rgbToHex(p[0], p[1], p[2])).slice(-6)

        if (p.length > 3) {
          const alpha = p[3]
          if (alpha == 0) {
            hex = '#ffffff'
          }
        }

        if (target) {
          target.style.background = hex
        }
      }
    },
    sniffBgColor(ev: Event) {
      if (this.matchbackground) {
        this.setBgColor(ev)
      }
      this.ready = true
    },
  },
}
</script>
<template>
  <div :class="border" :style="{ width: pixelSize, height: pixelSize, padding: derivedPadding }">
    <div :class="derivedClass">
      <span /><img :src="src"  />
    </div>
  </div>
</template>
<style></style>
