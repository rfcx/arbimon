<template>
  <div class="flex items-center gap-x-[5px]">
    <!-- frequency -->
    <button
      class="flex items-center justify-center p-1 w-7 h-7 rounded-[4px] bg-util-gray-03 hover:bg-util-gray-04 transition"
      :disabled="!store.userIsDataEntryMember"
      data-tooltip-style="light"
      data-tooltip-target="toggleFrequencyFilterTooltip"
      title="Frequency filter"
      @click="toggleFrequencyModal()"
    >
      <icon-custom-fi-filter class="text-frequency text-[10px] h-5" />
    </button>
    <div
      v-show="!store.userIsDataEntryMember"
      id="toggleFrequencyFilterTooltip"
      role="tooltip"
      class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
    >
      You do not have permission to filter frequency
      <div
        class="tooltip-arrow"
        data-popper-arrow
      />
    </div>
    <FrequencyFilterModal
      :visobject="visobject"
      :visible="isFrequencyFilterToggled"
      @emit-filter="$emit('emitFreqFilter', $event)"
      @cancel="toggleFrequencyModal"
    />
    <!-- spectro color -->
    <OnClickOutside
      class="relative"
      @trigger="isSpectroColorOpen = false"
    >
      <button
        class="flex items-center justify-center p-1 w-7 h-7 rounded-[4px] bg-util-gray-03 hover:bg-util-gray-04 transition"
        title="Toggle color spectrogram"
        @click="isSpectroColorOpen = !isSpectroColorOpen"
      >
        <icon-custom-fi-edit class="text-frequency text-[10px] h-5" />
      </button>
      <ul
        v-show="isSpectroColorOpen"
        class="flex flex-col gap-y-1 absolute bg-echo rounded py-1 z-10 w-50"
      >
        <li
          v-for="(color, idx) in spectroColors"
          :key="idx"
          class="flex items-center justify-start px-2 hover:(bg-util-gray-04 cursor-pointer)"
          :class="{ 'bg-util-gray-03': getActiveColor(idx) }"
          @click="setSpectroColor(idx)"
        >
          <div class="roi-thumbnail mr-3">
            <img
              :src="color.uri"
              class="h-8 w-18"
            >
          </div>
          <div class="text-xs">
            {{ color.name }}
          </div>
        </li>
      </ul>
    </OnClickOutside>
    <!-- download -->
    <button
      class="flex items-center justify-center p-1 w-7 h-7 rounded-[4px] bg-util-gray-03 hover:bg-util-gray-04 transition"
      :disabled="!store.userIsDataEntryMember"
      data-tooltip-style="light"
      data-tooltip-target="downloadRecTooltip"
      title="Download recording"
      @click="downloadRecording()"
    >
      <icon-custom-download class="text-frequency h-5" />
    </button>
    <div
      v-show="!store.userIsDataEntryMember"
      id="downloadRecTooltip"
      role="tooltip"
      class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
    >
      You do not have permission to download recording
      <div
        class="tooltip-arrow"
        data-popper-arrow
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { OnClickOutside } from '@vueuse/components'
import { initTooltips } from 'flowbite'
import { computed, onMounted, ref } from 'vue'

import type { Visobject } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

import { useStore } from '~/store'
import { type FreqFilter } from '../types'
import FrequencyFilterModal from './frequency-filter-modal.vue'

const props = defineProps<{
  visobject: Visobject
  isLoadingVisobject: boolean
}>()

const emit = defineEmits<{(event: 'emitColorSpectrogram', value: string): void, (e: 'emitFreqFilter', value: FreqFilter): void}>()

const store = useStore()
const selectedProjectSlug = computed(() => store.project?.slug)
const VITE_ARBIMON_LEGACY_BASE_URL = import.meta.env.VITE_ARBIMON_LEGACY_BASE_URL

const spectroColors = [
  { name: 'Grayscale', value: 'mtrue', uri: '/images/spectro-gray.png' },
  { name: 'Purple-Blue', value: 'mfalse', uri: '/images/spectro-blue-pink.png' },
  { name: 'Red-Blue', value: 'mfalse_p2', uri: '/images/spectro-pink.png' },
  { name: 'Brown-Green', value: 'mfalse_p3', uri: '/images/spectro-yellow.png' },
  { name: 'Orange-Yellow', value: 'mfalse_p4', uri: '/images/spectro-orange.png' }
]
const selectedSpectroColor = ref(spectroColors[0])
const defaultColor = ref('mtrue')
const isSpectroColorOpen = ref(false)
const isFrequencyFilterToggled = ref(false)

const setSpectroColor = (index: number): void => {
  selectedSpectroColor.value = spectroColors[index]
  localStorage.setItem('visualizer.spectro_color', selectedSpectroColor.value.value)
  emit('emitColorSpectrogram', selectedSpectroColor.value.value)
  isSpectroColorOpen.value = false
}

const getSpectroColor = (): string => {
  const colors = ['mtrue', 'mfalse', 'mfalse_p2', 'mfalse_p3', 'mfalse_p4']
    try {
      const selectedColor = localStorage.getItem('visualizer.spectro_color')
      return selectedColor && colors.includes(selectedColor) ? selectedColor : defaultColor.value
    } catch (e) {
      return defaultColor.value
    }
}

const getActiveColor = (index: number) => {
  return selectedSpectroColor.value.value === spectroColors[index].value
}

const downloadRecording = (): void => {
  const url = `${VITE_ARBIMON_LEGACY_BASE_URL}/legacy-api/project/${selectedProjectSlug.value}/recordings/download/${props.visobject.id}`
  const link = document.createElement('a')
  link.href = url
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const toggleFrequencyModal = () => {
  isFrequencyFilterToggled.value = !isFrequencyFilterToggled.value
}

onMounted(() => {
  initTooltips()
  const spectroColorFromCache = getSpectroColor()
  spectroColors.forEach(color => {
    if (color.value === spectroColorFromCache) {
      selectedSpectroColor.value = color
    }
})
  localStorage.setItem('visualizer.spectro_color', selectedSpectroColor.value.value)
})
</script>
