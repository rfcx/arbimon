<template>
  <div
    ref="container"
    class="freq-filter-component flex flex-col items-center justify-center relative
      select-none w-full h-63"
  >
    <img
      v-if="imgSrc"
      :src="imgSrc"
      alt="Spectrogram"
      class="w-full h-full object-cover pointer-events-none"
    >
    <div
      class="stop-band top"
      :style="{height:((1 - filterMax / maxFreq)*100) + '%'}"
    />
    <div
      class="stop-band bottom"
      :style="{height:((filterMin / maxFreq)*100) + '%'}"
    />
    <button
      class="btn btn-small btn-secondary bg-util-gray-04 absolute text-[11px] p-1 rounded-sm w-16
        -translate-y-[50%] -left-6 top"
      :style="{ top: topPosition }"
      @mousedown="onMouseDown"
    >
      {{ (filterMax / 1000).toFixed(1) }} kHz
    </button>

    <button
      class="btn btn-small btn-secondary bg-util-gray-04 absolute text-[11px] p-1 rounded-sm w-16
        -translate-y-[50%] -left-6 bottom"
      :style="{ top: bottomPosition }"
      @mousedown="onMouseDown"
    >
      {{ (filterMin / 1000).toFixed(1) }} kHz
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  imgSrc: string
  filterMin: number
  filterMax: number
  maxFreq: number
}>()

const emits = defineEmits<{(e: 'update:filterMax', value: number): void, (e: 'update:filterMin', value: number): void}>()

const container = ref<HTMLElement | null>(null)
const pressed = ref<HTMLElement | null>(null)

const topPosition = computed((): string =>
  `${(1 - props.filterMax / props.maxFreq) * 100}%`
)

const bottomPosition = computed((): string =>
  `${(1 - props.filterMin / props.maxFreq) * 100}%`
)

const onMouseDown = (event: MouseEvent): void => {
  const btn = event.buttons ?? event.which
  if (btn === 1) {
    pressed.value = event.target as HTMLElement
    document.addEventListener('mousemove', onMouseMove)
  }
}

const onMouseUp = (): void => {
  pressed.value = null
  document.removeEventListener('mousemove', onMouseMove)
}

const onMouseMove = (event: MouseEvent): void => {
  if (!pressed.value || !container.value) return
  const match = /(bottom|top)/.exec(pressed.value.className)
  if (!match) return
  const elRect = container.value.getBoundingClientRect()
  const y = event.pageY - elRect.top
  const parentHeight = (pressed.value.parentNode as HTMLElement).clientHeight
  let amount = props.maxFreq * Math.max(0, Math.min(1 - y / parentHeight, 1))
  amount = Math.floor(amount / 100) * 100 // quantize to 100Hz
  if (match[0] === 'top') {
    emits('update:filterMax', amount)
    if (props.filterMin > amount) emits('update:filterMin', amount)
  } else {
    emits('update:filterMin', amount)
    if (props.filterMax < amount) emits('update:filterMax', amount)
  }
}

onMounted((): void => {
  document.addEventListener('mouseup', onMouseUp)
})

onBeforeUnmount((): void => {
  document.removeEventListener('mouseup', onMouseUp)
  document.removeEventListener('mousemove', onMouseMove)
})

</script>

<style scoped>
.freq-filter-component {
  div.stop-band {
    position: absolute;
    width: 100%;
    background-color:rgba(255,0,255,.7);
    border-color:#ffffff;
    &.top {
      top: 0;
      border-bottom-width: 1px;
    }
    &.bottom {
      bottom:0;
      border-top-width: 1px;
    }
  }
}
</style>
