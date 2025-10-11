<template>
  <div class="pa-2">
    <v-card>
      <v-row no-gutters class="icon-cols">
        <v-col v-for="(item, index) in items">
          <div>
            <center>
              <ScaledImage
                :src="item.image"
                size="lg"
                @click="selectItem(item)"
                v-bind:responsive="false"
              />
              <v-btn @click="selectItem(item)">{{ item.name }}</v-btn>
            </center>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </div>
  <div class="pa-2">
    <v-btn prepend-icon="mdi-account" variant="outlined" @click="addUser()">Add new User</v-btn>
  </div>
</template>
<style>
.icon-cols {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
}
</style>
<script lang="ts" setup></script>
<script lang="ts">
import { vopidy } from '@/services/vopidy'

export default {
  name: 'History',
  props: {},
  data() {
    return { items: [] }
  },
  mounted() {
    this.getUsers()
  },
  beforeUnmount() {},
  methods: {
    addUser() {
      window.location.href = `${window.location.protocol}//${window.location.host}/api/auth`
    },
    selectItem(item) {
      vopidy('auth.login', { id: item.id }).then((res) => {
        localStorage.setItem('vopidy.id', item.id)
        localStorage.removeItem('page')
        window.location.href = `${window.location.protocol}//${window.location.host}/`
      })
    },
    getUsers() {
      vopidy('auth.users', {}).then((res) => {
        if (res.ok) {
          this.items = res.result
        }
      })
    },
  },
}
</script>
