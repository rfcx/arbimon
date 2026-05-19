<template>
  <canvas
    ref="canvasRef"
    :width="width"
    :height="height"
  />
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  min: number,
  max: number,
  ticks: number
  color: string,
  font: string,
  width: number,
  height: number
}>(), {
  min: 0,
  max: 24,
  ticks: 5,
  color: '#333333',
  font: '5px Arial',
  width: 20,
  height: 100
})

const canvasRef = ref<HTMLCanvasElement | null>(null)

const drawAxis = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const { min, max, ticks, color, font, width, height } = props
  const paddingBottom = 2
  const paddingTop = 2
  const axisHeight = height - paddingTop - paddingBottom
  if (!ctx) return
  // clear before redraw
  ctx.clearRect(0, 0, width, height)
  // Y axis line
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.moveTo(width, 0)
  ctx.lineTo(width, height)
  ctx.stroke()
  // Ticks & labels
  ctx.fillStyle = color
  ctx.font = font
  for (let i = 0; i <= ticks; i++) {
    const yValue = min + (i * (max - min)) / ticks
    const y = height - paddingBottom - (i * axisHeight) / ticks
    // Tick
    ctx.beginPath()
    ctx.moveTo(width - 3, y)
    ctx.lineTo(width, y)
    ctx.stroke()
    // Label
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText(yValue.toFixed(0), width - 5, y)
  }
}

// Redraw if props change dynamically
watch(() => ({ ...props }), drawAxis, { deep: true })

onMounted(() => {
  drawAxis()
})
</script>
