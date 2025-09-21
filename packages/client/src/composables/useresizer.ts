import { emit } from '@/composables/useeventbus'
import { useResizeObserver } from '@vueuse/core'
import { onBeforeMount, onMounted, onUnmounted, ref } from 'vue'

export function useResizer(el, heightOffset: number = 0) {
  const cols = ref(0)
  const width = ref(0)
  const height = ref(0)

  width.value = window.innerWidth.toString() + 'px'
  cols.value = Math.ceil(window.innerWidth / 170)
  height.value = (window.innerHeight - heightOffset).toString() + 'px'

  function start() {
    return useResizeObserver(el, (entries) => {
      const entry = entries[0]
      let { w, h } = entry.contentRect
      if (!h || h == 0) {
        h = window.innerHeight
      }

      if (!w || w == 0) {
        w = window.innerWidth
      }
      cols.value = Math.ceil(w / 170)
      width.value = w.toString() + 'px'
      height.value = (h - heightOffset).toString() + 'px'
      emit('resized', { cols: cols.value, size: { width: width.value, height: height.value } })
    })
  }

  onBeforeMount(() => start())
  onMounted(() => {
    width.value = window.innerWidth.toString() + 'px'
    cols.value = Math.ceil(window.innerWidth / 170)
    height.value = (window.innerHeight - heightOffset).toString() + 'px'
    emit('resized', { cols: cols.value, size: { width: width.value, height: height.value } })
  })
  onUnmounted(() => {})
  return { cols, width, height }
}
