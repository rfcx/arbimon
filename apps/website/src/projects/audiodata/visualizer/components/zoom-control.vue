<template>
  <div :class="['zoom-control inline-flex items-center absolute', horizontal ? 'horizontal' : 'vertical']">
    <div
      class="flex items-center gap-2"
      :class="[horizontal ? 'horizontal flex-row' : 'vertical flex-col']"
    >
      <button
        class="btn btn-xs rounded-sm bg-util-gray-03 border-0 py-1 px-0.5"
        @click="step(-1)"
      >
        <icon-fas-minus
          class="h-3 text-fog"
        />
      </button>
      <div
        ref="track"
        class="zoom-track relative overflow-hidden mx-2 cursor-pointer"
        @mousemove.prevent="onTrackMouseDown"
        @mousedown.prevent="onTrackMouseDown"
      >
        <div
          class="tick-marks absolute"
          :class="horizontal ? 'h-2' : 'w-2'"
        />
        <div
          class="btn zoom-marker bg-util-gray-04 border-util-gray-04 absolute p-0 width-[10px]"
          :style="markerStyle"
        />
      </div>
      <button
        class="btn btn-xs rounded-sm bg-util-gray-03 border-0 py-1 px-0.5"
        @click="step(1)"
      >
        <icon-fa-plus
          class="h-3 text-fog"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: number;
  horizontal?: boolean;
  delta?: number;
}>()

const emit = defineEmits<{(e: 'update:modelValue', v: number): void;}>()

const track = ref<HTMLElement | null>(null)
const horizontal = props.horizontal !== undefined && props.horizontal === true
const delta = props.delta ?? 0.1

const value = ref<number>(props.modelValue ?? 0)

watch(() => props.modelValue, v => (value.value = v ?? 0))

const markerStyle = computed(() => {
  const pct = horizontal === true ? value.value : (1 - value.value)
  return horizontal
    ? { left: `${pct * 100}%`, transform: 'translateX(-50%)', width: '10px', height: '100%' }
    : { top: `${pct * 100}%`, transform: 'translateY(-50%)', height: '10px', width: '100%' }
})

const step = (dir: number): void => {
  const next = Math.min(1, Math.max(0, value.value + dir * delta))
  value.value = next
  emit('update:modelValue', next)
}

const onTrackMouseDown = (e: MouseEvent): void => {
  if (!track.value) return
  if (e.buttons !== 1) return
  const rect = track.value.getBoundingClientRect()
  const px = horizontal ? e.clientX - rect.left : e.clientY - rect.top
  const ratio = horizontal ? px / rect.width : px / rect.height
  const level = horizontal ? ratio : 1 - ratio
  value.value = Math.min(1, Math.max(0, level))
  emit('update:modelValue', value.value)
}
</script>

<style scoped>
.zoom-control {
  gap: 4px;
}
.zoom-control.horizontal .zoom-track {
  display: inline-block;
  height: 1.5em;
  vertical-align: middle;
  width: 140px;
}
.zoom-control.vertical .zoom-track {
  display: inline-block;
  width: 1.5em;
  vertical-align: middle;
  height: 140px;
}
.zoom-control.horizontal {
  width: 200px;
  top: 20px;
  right: 36px;
}
.zoom-control.vertical {
  height: 200px;
  top: 60px;
  right: 8px;
}

.zoom-control .marker { position: absolute; background: #2563eb; border-radius: 2px; }
.tick-marks {
  left: 0;
  right: 0;
  top: 50%;
  margin-top: -5px;
  background-size: 11px 9px;
  background-image:
    linear-gradient(
      to right,
      rgba(0,0,0,0) 0%,
      rgba(0,0,0,0) 49%,
      black 49%,
      black 51%,
      rgba(0,0,0,0) 51%,
      rgba(0,0,0,0) 100%
    ),
    linear-gradient(
      to bottom,
      rgba(0,0,0,0) 0%,
      rgba(0,0,0,0) 49%,
      #242424 49%,
      #242424 50%,
      #242424 51%,
      rgba(0,0,0,0) 51%,
      rgba(0,0,0,0) 100%
    );
}
</style>
