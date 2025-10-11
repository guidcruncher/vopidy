<template>
  <div
    style="
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      z-index: 10000;
      background-color: #533191;
      background-repeat: no-repeat;
      background-size: cover;
      background-image: url('/images/55535.webp');
    "
  >
    <div style="margin-left: auto; margin-top: 100px; margin-right: auto">
      <center>
        <img src="/images/noplay1-sml.webp" style="width: 300px; height: 200px" />
        <h1>Loading....</h1>
      </center>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Loader',
  props: {},
  data() {
    return {}
  },
  mounted() {},
  beforeUnmount() {},
  methods: {},
}
</script>
