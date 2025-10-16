import { emit } from '@/composables/useeventbus'
import { useResizeObserver } from '@vueuse/core'
import { onBeforeMount, onMounted, onUnmounted, ref } from 'vue'

const columnSize = 200
export function useResizer(target, heightOffset: number = 0) {
  const cols = ref(0)
  const width = ref(0)
  const height = ref(0)

  width.value = window.innerWidth.toString() + 'px'
  cols.value = Math.ceil(window.innerWidth / columnSize)
  height.value = (window.innerHeight - heightOffset).toString() + 'px'

  function start(el) {
    return useResizeObserver(el, (entries) => {
      window.requestAnimationFrame((): void | undefined => {
        if (!Array.isArray(entries) || !entries.length) {
          return
        }

        const entry = entries[0]
        let { w, h } = entry.contentRect
        if (!h || h == 0) {
          h = window.innerHeight
        }
        if (!w || w == 0) {
          w = window.innerWidth
        }
        cols.value = Math.ceil(w / columnSize)
        width.value = w.toString() + 'px'
        height.value = (h - heightOffset).toString() + 'px'
        emit('resized', { cols: cols.value, size: { width: width.value, height: height.value } })
      })
    })
  }

  onBeforeMount(() => {})
  onMounted(() => {
    width.value = window.innerWidth.toString() + 'px'
    cols.value = Math.ceil(window.innerWidth / columnSize)
    height.value = (window.innerHeight - heightOffset).toString() + 'px'
    emit('resized', { cols: cols.value, size: { width: width.value, height: height.value } })
  })
  onUnmounted(() => {})
  start(target)
  return { cols, width, height }
}
