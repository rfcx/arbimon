<template>
  <canvas
    ref="canvasRef"
    class="h-3 w-60"
  />
</template>
<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue'

  const props = defineProps<{
    selectedPalette: string[]
  }>()

  const canvasRef = ref<HTMLCanvasElement | null>(null)

  const draw = () => {
    const canvas = canvasRef.value
    if (!canvas) return

    const pal = props.selectedPalette

    const width = pal.length

    canvas.width = width
    canvas.height = 1

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    for (let i = 0; i < width; i++) {
      ctx.fillStyle = pal[i]
      ctx.fillRect(i, 0, 1, 1)
    }
  }

  watch(() => props.selectedPalette, () => {
    draw()
  }, { deep: true })

  onMounted(() => {
    draw()
  })
</script>
