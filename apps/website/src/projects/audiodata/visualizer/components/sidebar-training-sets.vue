<template>
  <div
    id="accordion-collapse"
    data-accordion="collapse"
    class="flex flex-col gap-y-2 px-4 py-2 bg-moss shadow"
  >
    <div
      id="accordion-collapse-heading-training"
      data-accordion="open"
    >
      <button
        type="button"
        class="flex justify-start items-center w-full py-2 gap-x-1 text-insight dark:(bg-transparent text-insight)"
        data-accordion-target="#accordion-collapse-body-training"
        aria-expanded="false"
        aria-controls="accordion-collapse-body-training"
        @click="toggleTraining = !toggleTraining"
      >
        <icon-fa-chevron-right
          data-accordion-icon
          class="w-3 h-3 fa-chevron-right"
        />
        <icon-fa-chevron-down
          data-accordion-icon
          class="w-3 h-3 fa-chevron-up hidden"
        />
        <span>Training Sets (RF Algorithm)</span>
      </button>
    </div>
    <div
      id="accordion-collapse-body-training"
      class="hidden w-[90%] flex flex-col gap-y-2"
      aria-labelledby="accordion-collapse-heading-training-set"
    >
      <div class="flex flex-row justify-between items-center">
        <BasicSearchSelect
          v-model="trainingSetSelected"
          class="w-full"
          :options="options"
          :w-full="true"
          placeholder="Select a training set"
        />
        <button
          class="flex ml-2 items-center justify-center p-1 h-[34px] w-[34px] min-w-[34px] rounded-[4px] bg-util-gray-03 hover:bg-util-gray-04 transition"
          data-tooltip-target="tooltipTrainingSetsId"
          data-tooltip-style="light"
          @click="toggleTrainingSets"
        >
          <icon-custom-ic-plus-icon class="text-frequency h-4" />
        </button>
        <div
          id="tooltipTrainingSetsId"
          role="tooltip"
          class="absolute z-200 invisible inline-block px-3 py-2 text-sm font-medium text-insight transition-opacity duration-300 bg-util-gray-03 rounded-lg shadow-sm opacity-0 tooltip"
        >
          Create a new training set
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
      </div>
    </div>

    <div
      v-show="toggleTraining && trainingSetSelectedText !== ''"
      id="accordion-collapse-heading-training-sets"
    >
      <button
        type="button"
        class="flex flex-row justify-between items-center w-full py-2 gap-x-1 text-insight dark:(bg-transparent text-insight)"
        data-accordion-target="#accordion-collapse-body-training-sets"
        aria-expanded="false"
        aria-controls="accordion-collapse-body-training-sets"
      >
        <div>
          <icon-fa-chevron-right
            data-accordion-icon
            class="w-3 h-3 fa-chevron-right"
          />
          <icon-fa-chevron-down
            data-accordion-icon
            class="w-3 h-3 fa-chevron-up hidden"
          />
          <span class="ml-1">{{ trainingSetSelectedText }}</span>
        </div>
        <!-- Change number here! @Zhanya -->
        <span class="shrink-0 tabular-nums ml-1 bg-util-gray-03 rounded-full px-2 py-1 mr-1 text-[12px] font-bold">{{ 0 }}</span>
      </button>
    </div>
    <div
      v-show="toggleTraining && trainingSetSelectedText !== ''"
      id="accordion-collapse-body-training-sets"
      class="hidden w-[90%] flex flex-col gap-y-2 text-sm font-medium"
      aria-labelledby="accordion-collapse-heading-training-sets"
    >
      There is no training data in this recording.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { LegacyTrainingSet } from '@rfcx-bio/common/api-arbimon/audiodata/project'
import type { Visobject } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

import BasicSearchSelect from './basic-search-select.vue'

const props = defineProps<{
  visobject: Visobject
  trainingSet?: LegacyTrainingSet[]
}>()

const toggleTraining = ref<boolean>(false)
const trainingSetSelected = ref<string | number | undefined>(undefined)
const options = computed(() => props.trainingSet?.map(t => ({ label: t.name, value: t.id })) ?? [])

const toggleTrainingSets = () => {
  console.info(trainingSetSelected.value)
  // When click on ic-plus-icon (trainingSetSelected.value is training set id) @Zhanya
}
const trainingSetSelectedText = ref<string>('')
watch(() => trainingSetSelected.value, (ts) => {
  if (ts === undefined) return
  const selected = props.trainingSet?.find(t => t.id === ts)
  trainingSetSelectedText.value = selected?.species_name ?? ''
})
</script>

<style lang="scss">

button[aria-expanded=true] .fa-chevron-up {
  display: inline-block;
}
button[aria-expanded=true] .fa-chevron-right {
  display: none;
}
button[aria-expanded=flase] .fa-chevron-up {
  display: none;
}
button[aria-expanded=false] .fa-chevron-right {
  display: inline-block;
}

input::placeholder::-webkit-input-placeholder {
  --tw-placeholder-opacity: 1;
  color: rgba(161, 161, 158, var(--tw-placeholder-opacity)) !important;
  font-size: 10px !important;
}
input::placeholder::-moz-placeholder {
  --tw-placeholder-opacity: 1;
  color: rgba(161, 161, 158, var(--tw-placeholder-opacity));
}
input::placeholder::-ms-input-placeholder {
  --tw-placeholder-opacity: 1;
  color: rgba(161, 161, 158, var(--tw-placeholder-opacity));
}
input::placeholder {
  --tw-placeholder-opacity: 1;
  color: rgba(161, 161, 158, var(--tw-placeholder-opacity)) !important;
}
</style>
