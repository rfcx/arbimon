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
  normalized: boolean
  amplitudeThreshold?: number
  amplitudeThresholdType?: string
  palette: string[]
  visualMax: number
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

const isNormVectorEmpty = (nv?: NormVector): boolean => {
  return !nv || Object.keys(nv).length === 0
}

const draw = () => {
  if (!props.soundscapeScidx || !canvasRef.value || !props.palette?.length) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let vmax = props.visualMax
  let ampTh = props.amplitudeThreshold ?? 0

  if (props.amplitudeThresholdType === 'relative-to-peak-maximum') {
    ampTh *= getMaxAmplitude()
  }

  const palette = props.palette
  const pallen1 = 1.0 * (palette.length - 1)

  let color = (v: number, j?: number): string => {
    const i = Math.max(0, Math.min(((v * pallen1 / vmax) | 0), pallen1))
    return palette[i]
  }

  if (!isNormVectorEmpty(props.soundscapeNormVector)) {
    vmax = 1
    const baseColor = color
    color = (v: number, j?: number) => {
      const n = props.soundscapeNormVector?.[Number(j)] ?? 1
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
        let act = 0
        for (let al = cell[1], ali = 0, ale = al.length; ali < ale; ++ali) {
          if (al[ali] > ampTh) { act++ }
        }
        ctx.fillStyle = color(act, +j)
      } else {
        ctx.fillStyle = color(cell[0], +j)
      }
      ctx.fillRect(+j, h - (+i) - 1, 1, 1)
    }
  }
}

watch(
  () => props.soundscapeScidx,
  () => {
    maxAmplitude.value = 0
  }
)

watch(
  () => [
    props.normalized,
    props.amplitudeThreshold,
    props.amplitudeThresholdType,
    props.visualMax
  ],
  draw
)

watch(() => props.palette, draw)
watch(() => props.soundscapeNormVector, draw)

onMounted(() => {
  draw()
})

</script>
