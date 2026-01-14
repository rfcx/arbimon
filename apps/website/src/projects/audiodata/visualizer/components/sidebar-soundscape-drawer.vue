<template>
  <canvas
    ref="canvasRef"
    class="block crisp-image w-full h-60"
  />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { type NormVector, type SoundscapeScidx } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

const props = defineProps<{
  normalized?: boolean
  amplitudeThreshold?: number
  amplitudeThresholdType?: string
  palette: string[]
  visualMax?: number
  soundscapeScidx: SoundscapeScidx | undefined
  soundscapeNormVector: NormVector | undefined
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const maxAmplitude = ref<number>(0)

const getMaxAmplitude = (): number => {
  if (!props.soundscapeScidx) return 0

  if (props.soundscapeScidx.__maxAmplitude === undefined) {
    const index = props.soundscapeScidx?.index
    if (index === undefined) return 0

    maxAmplitude.value = Object.keys(index).reduce((maxAmp, i) => {
      const row = index[Number(i)]

      return Object.keys(row).reduce((rowMax, j) => {
        const amps = row[Number(j)][1] ?? [0]
        return Math.max(rowMax, Math.max(...amps))
      }, maxAmp)
    }, 0)
  }

  return maxAmplitude.value
}

const draw = () => {
  if (!props.soundscapeScidx || !canvasRef.value || !props.palette?.length) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let vmax = props.visualMax ?? 1
  let ampTh = props.amplitudeThreshold ?? 0

  if (props.amplitudeThresholdType === 'relative-to-peak-maximum') {
    ampTh *= getMaxAmplitude()
  }

  const palette = props.palette
  const pallen1 = palette.length - 1

  let color = (v: number, j?: number): string => {
    const i = Math.max(0, Math.min(((v * pallen1) / vmax) | 0, pallen1))
    return palette[i]
  }

  if (props.soundscapeNormVector) {
    vmax = 1
    const baseColor = color
    color = (v: number, j?: number) => {
      const n = (j !== undefined && props.soundscapeNormVector !== undefined && props.soundscapeNormVector[j]) || 1
      return baseColor(v / n)
    }
  }

  const w = props.soundscapeScidx.width
  const h = props.soundscapeScidx.height

  canvas.width = w
  canvas.height = h

  ctx.fillStyle = color(0)
  ctx.fillRect(0, 0, w, h)

  for (const i in props.soundscapeScidx.index) {
    const row = props.soundscapeScidx.index[i]
    for (const j in row) {
      const cell = row[j]

      if (ampTh && cell[1]) {
        let active = 0
        for (const amp of cell[1]) {
          if (amp > ampTh) active++
        }
        ctx.fillStyle = color(active, Number(j))
      } else {
        ctx.fillStyle = color(cell[0], Number(j))
      }

      ctx.fillRect(Number(j), h - Number(i) - 1, 1, 1)
    }
  }
}

watch(() => [props.palette, props.amplitudeThreshold, props.amplitudeThresholdType, props.visualMax], () => {
  draw()
}, { deep: true })

onMounted(() => {
  draw()
})

</script>
