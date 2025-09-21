import { emit } from '@/composables/useeventbus'
import { useResizeObserver } from '@vueuse/core'
import { onBeforeMount, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'

export function useResizer(el, heightOffset: number = 0) {
  const cols = ref(0)
  const width = ref(0)
  const height = ref(0)

  function start() {
    useResizeObserver(el, (entries) => {
      const entry = entries[0]
      let { w, h } = entry.contentRect
      if (h == 0) {
        h = window.innerHeight
      }

      cols.value = w
      width.value = w
      height.value = h - heightOffset
      emit('resized', { cols: cols.value, size: { width: width.value, height: height.value } })
    })
  }

  onBeforeMount(() => start())
  onMounted(() => {
    width.value = window.innerWidth
    cols.value = window.innerWidth
    height.value = window.innerHeight - heightOffset
    emit('resized', { cols: cols.value, size: { width: width.value, height: height.value } })
  })
  onUnmounted(() => {})
  return { cols, width, height }
}
