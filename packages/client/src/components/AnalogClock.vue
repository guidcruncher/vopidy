<script lang="ts">
import { on, emit, off } from '../composables/useeventbus'

export default {
  name: 'AnalogClock',
  data() {
    return {
      date: '',
      time: '',
      timer: 0,
      hrPosition: 0,
      minPositon: 0,
      secPosition: 0,
    }
  },
  mounted() {
    this.init()
    this.timer = setInterval(() => {
      this.tick()
    }, 1000)
  },
  beforeUnmount() {
    clearInterval(this.timer)
    this.timer = 0
  },
  methods: {
    init() {
      const date = new Date()
      let hr = date.getHours()
      let min = date.getMinutes()
      let sec = date.getSeconds()
      this.hrPosition = (hr * 360) / 12 + (min * (360 / 60)) / 12
      this.minPosition = (min * 360) / 60 + (sec * (360 / 60)) / 60
      this.secPosition = (sec * 360) / 60
    },
    tick() {
      const date = new Date()
      const HOURHAND = document.querySelector('#hour')
      const MINUTEHAND = document.querySelector('#minute')
      const SECONDHAND = document.querySelector('#second')

      let hr = date.getHours()
      let min = date.getMinutes()
      let sec = date.getSeconds()

      this.hrPosition = this.hrPosition + 3 / 360
      this.minPosition = this.minPosition + 6 / 60
      this.secPosition = this.secPosition + 6

      let changed = false
      const dateFormat = new Intl.DateTimeFormat('default', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      const timeFormat = new Intl.DateTimeFormat('default', {
        hour: 'numeric',
        minute: 'numeric',
        hourCycle: 'h23',
      })
      if (this.date != dateFormat.format(date)) {
        changed = true
        this.date = dateFormat.format(date)
      }

      if (this.time != timeFormat.format(date)) {
        changed = true
        this.time = timeFormat.format(date)
      }

      HOURHAND.style.transform = 'rotate(' + this.hrPosition + 'deg)'
      MINUTEHAND.style.transform = 'rotate(' + this.minPosition + 'deg)'
      SECONDHAND.style.transform = 'rotate(' + this.secPosition + 'deg)'

      if (changed) {
        emit('time_changed', {
          utc: new Date(
            Date.UTC(
              date.getUTCFullYear(),
              date.getUTCMonth(),
              date.getUTCDate(),
              date.getUTCHours(),
              date.getUTCMinutes(),
              0,
            ),
          ),
          local: new Date(date.setSeconds(0)),
        })
      }
    },
  },
}
</script>

<template>
  <div class="clockbox">
    <svg
      id="clock"
      xmlns="http://www.w3.org/2000/svg"
      width="150"
      height="150"
      viewBox="0 0 600 600"
    >
      <g id="face">
        <circle class="circle" cx="300" cy="300" r="253.9" />
        <path
          class="hour-marks"
          d="M300.5 94V61M506 300.5h32M300.5 506v33M94 300.5H60M411.3 107.8l7.9-13.8M493 190.2l13-7.4M492.1 411.4l16.5 9.5M411 492.3l8.9 15.3M189 492.3l-9.2 15.9M107.7 411L93 419.5M107.5 189.3l-17.1-9.9M188.1 108.2l-9-15.6"
        />
        <circle class="mid-circle" cx="300" cy="300" r="16.2" />
      </g>
      <g id="hour">
        <path class="hour-arm" d="M300.5 298V142" />
        <circle class="sizing-box" cx="300" cy="300" r="253.9" />
      </g>
      <g id="minute">
        <path class="minute-arm" d="M300.5 298V67" />
        <circle class="sizing-box" cx="300" cy="300" r="253.9" />
      </g>
      <g id="second">
        <path class="second-arm" d="M300.5 350V55" />
        <circle class="sizing-box" cx="300" cy="300" r="253.9" />
      </g>
    </svg>
  </div>
  <div class="text-subtitle-1 text-center text-uppercase">
    {{ date }}
  </div>
</template>
<style>
.clockbox,
#clock {
  width: 100%;
}

.circle {
  fill: none;
  stroke: #bdbdbd;
  stroke-width: 9;
  stroke-miterlimit: 10;
}

.mid-circle {
  fill: #bdbdbd;
}
.hour-marks {
  fill: none;
  stroke: #bdbdbd;
  stroke-width: 9;
  stroke-miterlimit: 10;
}

.hour-arm {
  fill: none;
  stroke: #bdbdbd;
  stroke-width: 17;
  stroke-miterlimit: 10;
}

.minute-arm {
  fill: none;
  stroke: #bdbdbd;
  stroke-width: 11;
  stroke-miterlimit: 10;
}

.second-arm {
  fill: none;
  stroke: #bdbdbd;
  stroke-width: 4;
  stroke-miterlimit: 10;
}

.sizing-box {
  fill: none;
}

#hour,
#minute,
#second {
  transform-origin: 300px 300px;
  transition: transform 0.5s ease-in-out;
}
</style>
