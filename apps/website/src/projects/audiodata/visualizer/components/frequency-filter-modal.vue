<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[9999] isolate flex items-center justify-center ml-120"
  >
    <div class="bg-moss rounded-xl shadow-lg max-w-md w-full p-6">
      <div class="flex flex-col gap-y-6">
        <div class="flex flex-row items-center justify-between">
          <h2 class="text-2xl font-header">
            Filter Audio Frequency
          </h2>
          <button
            type="button"
            title="Cancel"
            @click="$emit('cancel')"
          >
            <icon-custom-fi-close-thin class="h-6 w-6 cursor-pointer text-insight" />
          </button>
        </div>
        <FriquencyFilterControl
          v-model:filter-min="filterMin"
          v-model:filter-max="filterMax"
          :img-src="getImg()"
          :max-freq="visobject.span"
        />
        <div class="flex flex-row justify-between items-center gap-x-4 mt-4">
          <button
            class="px-4 py-2 btn btn-secondary btn-medium w-full"
            @click="$emit('cancel')"
          >
            Cancel
          </button>
          <button
            class="btn-primary px-4 py-2 btn btn-medium w-full"
            @click="handleSelectedFrequency"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { onMounted, ref } from 'vue'

import { type Visobject } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

import { type FreqFilter } from '../types'
import FriquencyFilterControl from './frequency-filter-control.vue'

const props = defineProps<{
  visobject: Visobject
  visible: boolean
}>()

const emits = defineEmits<{(e: 'cancel'): void, (e: 'emitFilter', value: FreqFilter): void}>()

const VITE_ARBIMON_LEGACY_BASE_URL = import.meta.env.VITE_ARBIMON_LEGACY_BASE_URL
const filterMax = ref(0)
const filterMin = ref(0)

const handleSelectedFrequency = (): void => {
  emits('emitFilter', { filterMin: filterMin.value, filterMax: filterMax.value })
  emits('cancel')
}

const getImg = () => {
  return `${VITE_ARBIMON_LEGACY_BASE_URL}${props.visobject.tiles.set[0].src}`
}

onMounted(() => {
  filterMax.value = props.visobject.span
})

</script>
