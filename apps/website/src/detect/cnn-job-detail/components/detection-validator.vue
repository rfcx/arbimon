<template>
  <div
    id="toast-undo"
    class="flex flex-row items-center space-x-4 justify-between text-insight bg-pitch shadow sticky z-5 top-0 py-3"
    role="alert"
  >
    <div class="flex items-center gap-x-4 text-base">
      <div class="text-opacity-50">
        Mark as:
      </div>
      <button
        id="validationDropdownBtn"
        data-dropdown-toggle="validationDropdownHover"
        class="flex flex-row items-center justify-between bg-transparent border-1 border-frequency rounded-full text-insight px-5 py-2 w-48 disabled:(border-util-gray-01 text-util-gray-01)"
        type="button"
        :disabled="props.isProcessing"
      >
        <div class="flex flex-row items-center gap-x-2">
          <ValidationStatus :value="props.validation" />
          <span>{{ props.filterOptions.find(o => o.value === props.validation)?.label ?? 'Validation' }}</span>
        </div>
        <icon-fa-chevron-down class="w-2.5 h-2.5 fa-chevron-down text-insight" />
      </button>
      <div
        id="validationDropdownHover"
        class="z-10 hidden rounded-lg p-3 bg-moss w-52 flex flex-col gap-y-3"
      >
        <ul
          aria-labelledby="validationDropdownBtn"
          class="flex flex-col gap-y-1"
        >
          <li
            v-for="option in props.filterOptions"
            :key="option.value"
            class="bg-moss hover:text-util-gray-01"
            @click="validateDetections(option.value)"
          >
            <div
              class="border-1 rounded-full cursor-pointer bg-moss"
              :class="{'cursor-not-allowed text-util-gray-01': props.isProcessing, 'border-chirp': props.validation === option.value, 'border-transparent': props.validation !== option.value}"
            >
              <div
                class="flex flex-row gap-x-2 items-center h-10 pl-5"
              >
                <ValidationStatus :value="formatStatus(option.value)" />
                {{ option.label }}
              </div>
            </div>
          </li>
        </ul>
      </div>
      <icon-custom-ic-loading
        v-if="props.isProcessing"
        class="animate-spin w-6 h-6 text-insight"
      />
    </div>

    <div class="text-base flex gap-x-5 items-center">
      <span>
        {{ props.detectionCount }} selected
      </span>
      <button
        class="btn border-1 border-util-gray-03 text-spoonbill bg-spoonbill bg-opacity-10 rounded-lg py-1 px-2 flex items-center gap-x-3"
        @click="close()"
      >
        <span>Clear</span>
        <span><icon-custom-fi-close class="inline w-4 h-4 text-spoonbill" /></span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Dropdown, initDropdowns } from 'flowbite'
import { onMounted, ref } from 'vue'

import { type ArbimonReviewStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

import type { DetectionValidationStatus } from './types'
import ValidationStatus from './validation-status.vue'

const props = defineProps<{
  detectionCount: number | null,
  filterOptions: DetectionValidationStatus[],
  validation: ArbimonReviewStatus,
  isProcessing: boolean
}>()

const emit = defineEmits<{(e: 'emitValidation', validation: ArbimonReviewStatus): void, (e: 'emitClose'): void}>()

let validationDropdown: Dropdown
const validationDropdownHover = ref<HTMLElement | null>(null)

const formatStatus = (status: ArbimonReviewStatus | 'all') => {
  return status as ArbimonReviewStatus
}

const validateDetections = (value: ArbimonReviewStatus) => {
  if (props.isProcessing) return
  emit('emitValidation', value)
}

const close = () => {
  validationDropdown.hide()
  emit('emitClose')
}

onMounted(() => {
  initDropdowns()
  validationDropdownHover.value = document.getElementById('validationDropdownHover')
  validationDropdown = new Dropdown(
    document.getElementById('validationDropdownHover'),
    document.getElementById('validationDropdownBtn')
  )
})
</script>

<style lang="scss"></style>
