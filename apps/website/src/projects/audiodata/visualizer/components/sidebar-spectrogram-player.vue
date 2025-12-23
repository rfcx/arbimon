<template>
  <div class="flex flex-col gap-4 px-4 py-2 bg-moss shado text-sm font-medium">
    <!-- Progress bar -->
    <div class="flex-1 w-[90%]">
      <input
        v-model="currentTime"
        type="range"
        min="0"
        :max="duration"
        step="0.1"
        class="w-full h-1 accent-frequency appearance-none custom-slider"
        @input="seekAudio"
      >
    </div>

    <div class="flex items-center gap-x-[5px]">
      <!-- Prev rec -->
      <button
        class="flex items-center justify-center p-1 w-7 h-7 rounded-[4px] bg-util-gray-03 hover:bg-util-gray-04 transition"
        title="Previous recording"
        @click="setPrevRecording"
      >
        <icon-custom-fi-rewind class="h-5" />
      </button>
      <!-- Play button -->
      <button
        class="flex items-center justify-center p-1 w-7 h-7 rounded-[4px] bg-util-gray-03 hover:bg-util-gray-04 transition"
        @click="togglePlay"
      >
        <icon-custom-fi-skip-forward v-if="!isPlaying" />
        <icon-fa-pause
          v-else
          class="text-frequency text-[10px] h-5"
        />
      </button>
      <!-- Stop button -->
      <button
        class="flex items-center justify-center p-1 w-7 h-7 rounded-[4px] bg-util-gray-03 hover:bg-util-gray-04 transition"
        @click="toggleStop"
      >
        <icon-custom-fi-stop class="h-5" />
      </button>
      <!-- Next rec -->
      <button
        class="flex items-center justify-center p-1 w-7 h-7 rounded-[4px] bg-util-gray-03 hover:bg-util-gray-04 transition"
        title="Next recording"
        @click="setNextRecording"
      >
        <icon-custom-fi-fast-forward class="h-5" />
      </button>
      <!-- Volume control -->
      <OnClickOutside
        class="relative"
        @trigger="isGainOpen = false"
      >
        <button
          class="flex items-center justify-center p-1 w-7 h-7 rounded-[4px] bg-util-gray-03 hover:bg-util-gray-04 transition"
          title="Recording volume"
          @click="isGainOpen = !isGainOpen"
        >
          <icon-custom-fi-volume class="text-frequency text-[10px] h-5" />
        </button>
        <div
          v-show="isGainOpen"
          class="flex flex-col gap-y-1 absolute bg-echo -left-[60px] rounded-md p-2 z-10 w-75"
        >
          <div class="flex flex-row w-full items-center justify-end gap-x-2 pl-5">
            <icon-custom-fi-volume class="text-insight text-[10px] h-5" />
            <input
              v-model.number="currentIndex"
              type="range"
              min="0"
              :max="gainLevels.length - 1"
              step="1"
              class="w-24 flex-1 accent-frequency appearance-none cursor-pointer custom-gain"
              @input="onChange"
            >
          </div>
          <div class="flex flex-row items-center text-insight gap-x-1">
            Gain
            <span
              v-for="(gain, ind) in gainLevels"
              :key="'level_' + gain"
              class="flex items-center text-frequency text-sm justify-center p-1 w-6 cursor-pointer rounded-[4px] bg-transparent hover:bg-util-gray-04 transition"
              :class="{'bg-util-gray-04': selectedGain === gain }"
              @click="setGain(ind)"
            >
              x{{ gain }}
            </span>
          </div>
        </div>
      </OnClickOutside>
      <SidebarControls
        :visobject="visobject"
        :is-loading-visobject="isLoadingVisobject"
        @emit-color-spectrogram="$emit('updateColorSpectrogram', $event)"
        @emit-freq-filter="$emit('updateFreqFilter', $event)"
      />
    </div>
    <div class="flex flex-row justify-between w-[70%]">
      <div class="flex flex-row gap-x-1 items-center">
        <icon-custom-fi-play class="text-insight text-sm h-5" />
        <span>{{ formatTime(currentTime) }}</span>
        s
      </div>
      <div class="flex flex-row gap-x-1 items-center">
        <icon-custom-fi-navigation class="text-insight text-sm h-5" />
        <span>{{ props.pointer.sec.toFixed(2) }}</span>
        s,
        <span>{{ (props.pointer.hz / 1000).toFixed(1) }} kHz</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { OnClickOutside } from '@vueuse/components'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { Visobject } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

import { type FreqFilter } from '../types'
import SidebarControls from './sidebar-controls.vue'
import { type Pointer } from './visualizer-spectrogram.vue'

const props = defineProps<{
  visobject: Visobject
  isLoadingVisobject: boolean
  freqFilter?: FreqFilter
  pointer: Pointer
}>()

const emit = defineEmits<{(event: 'emitCurrentTime', currentTime: number): void,
  (e: 'updateColorSpectrogram', value: string): void,
  (e: 'updateFreqFilter', value: FreqFilter): void,
  (e: 'nextRecording'): void,
  (e: 'prevRecording'): void
}>()

const VITE_ARBIMON_LEGACY_BASE_URL = import.meta.env.VITE_ARBIMON_LEGACY_BASE_URL

const audio = ref<HTMLAudioElement>()
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const isGainOpen = ref(false)
const gainLevels = [1, 2, 5, 10, 15, 20, 25, 30, 50]
const currentIndex = ref(8)

const selectedGain = computed(() => gainLevels[currentIndex.value])

const createAudio = () => {
  audio.value?.pause()
  audio.value = undefined
  currentTime.value = 0
  const url = `${VITE_ARBIMON_LEGACY_BASE_URL}${props.visobject.audioUrl + (props.freqFilter !== undefined ? `?maxFreq=${props.freqFilter?.filterMax}&minFreq=${props.freqFilter?.filterMin}` : '')}${selectedGain.value && selectedGain.value !== 1 ? '?gain=' + selectedGain.value : ''}`
  audio.value = new Audio(url)
  audio.value?.addEventListener('loadedmetadata', () => {
    duration.value = audio.value?.duration ?? 0
  })
  audio.value?.addEventListener('timeupdate', () => {
    currentTime.value = audio.value?.currentTime ?? 0
    emit('emitCurrentTime', currentTime.value)
  })
  audio.value?.addEventListener('ended', () => {
    isPlaying.value = false
    currentTime.value = 0
  })
}

const formatTime = (sec: number) => {
  const minutes = Math.floor(sec / 60)
  const seconds = Math.floor(sec % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const togglePlay = () => {
  if (isPlaying.value) {
    audio.value?.pause()
  } else {
    audio.value?.play()
  }
  isPlaying.value = !isPlaying.value
}

const toggleStop = () => {
  if (audio.value === undefined) return
  isPlaying.value = false
  audio.value.pause()
  audio.value.currentTime = 0
  currentTime.value = 0
}

const seekAudio = () => {
  if (audio.value === undefined) return
  audio.value.currentTime = currentTime.value
}

const onChange = (e: Event): void => {
  const target = e.target as HTMLInputElement
  currentIndex.value = Number(target.value)
  createAudio()
}

const setGain = (ind: number) => {
  currentIndex.value = ind
  createAudio()
}

const setNextRecording = () => {
  emit('nextRecording')
}

const setPrevRecording = () => {
  emit('prevRecording')
}

watch(() => props.freqFilter, () => {
  createAudio()
})

onMounted(() => {
  createAudio()
})

onBeforeUnmount(() => {
  audio.value?.pause()
  if (audio.value === undefined) return
  audio.value.src = ''
})
</script>

<style lang="scss">
.custom-gain,
.custom-slider {
  appearance: none;
  background: #ADFF2C;
  height: 4px;
  border-radius: 2px;
}
.custom-gain::-webkit-slider-thumb,
.custom-slider::-webkit-slider-thumb {
  appearance: none !important;
  width: 2px !important;
  height: 13px !important;
  background: #ADFF2C !important;
  cursor: pointer !important;
  border-radius: 1px !important;
  margin-top: -4px !important;
}

.custom-gain::-moz-range-thumb,
.custom-slider::-moz-range-thumb {
  width: 2px;
  height: 16px;
  background: #ADFF2C;
  cursor: pointer;
  border: none;
  border-radius: 1px;
}

.custom-slider::-webkit-slider-runnable-track {
  background: #7F7D78 !important;
  height: 4px !important;
  border-radius: 2px !important;
}
.custom-slider::-moz-range-track {
  background: #7F7D78;
  height: 4px;
  border-radius: 2px;
}
.custom-gain::-webkit-slider-runnable-track {
  background: #fff !important;
  height: 4px !important;
  border-radius: 2px !important;
}
.custom-gain::-moz-range-track {
  background: #fff;
  height: 4px;
  border-radius: 2px;
}
</style>
