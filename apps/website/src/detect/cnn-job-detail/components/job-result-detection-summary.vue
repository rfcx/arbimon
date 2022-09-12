<template>
  <div v-if="isLoadingJobSummary" />
  <div v-else-if="isErrorJobSummary" />
  <div
    v-else
    class="job-result-detection-summary-wrapper"
  >
    <h3 class="job-result-detection-summary-header text-subtle text-sm mb-2">
      Detection summary
    </h3>
    <div class="job-result-detection-summary-detail mt-2 grid grid-cols-12 gap-2">
      <template
        v-for="(column, idx) in [displaySpeciesColumn1, displaySpeciesColumn2]"
        :key="'detection-summary-species-column-' + idx"
      >
        <div class="col-span-6 <sm:col-span-12">
          <div class="job-result-validation-status-detail grid grid-cols-6 gap-2">
            <template
              v-for="item in column"
              :key="'validation-status-' + item.label"
            >
              <div class="col-span-1 justify-self-start font-semibold text-right">
                {{ displayValue(item.numberOfDetections) }}
              </div>
              <div class="col-span-5 truncate">
                {{ item.speciesName }}
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
    <div
      v-if="details.length > displayItemNumber"
      class="flex justify-end items-center mt-2"
    >
      <button
        class="btn btn-icon ml-4"
        :disabled="displayIndex === 0"
        @click="previousPage()"
      >
        <icon-fas-chevron-left class="w-3 h-3" />
      </button>
      <button
        class="btn btn-icon ml-2"
        :disabled="displayIndex === Math.ceil(details.length / displayItemNumber) - 1"
        @click="nextPage()"
      >
        <icon-fas-chevron-right class="w-3 h-3" />
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { AxiosInstance } from 'axios'
import { computed, inject, ref } from 'vue'

import { displayValue } from '@rfcx-bio/utils/number'

import { useGetJobDetectionSummary } from '@/detect/_composables/use-get-job-detection-summary'
import { apiClientBioKey } from '@/globals'

const props = defineProps<{
  jobId: number
  projectId: string
}>()

const displayItemNumber = 10
const displayIndex = ref(0)

// External data
const apiBio = inject(apiClientBioKey) as AxiosInstance
const { isLoading: isLoadingJobSummary, isError: isErrorJobSummary, data: jobSummaryData } = useGetJobDetectionSummary(apiBio, props.jobId, { limit: displayItemNumber.toString(), offset: displayIndex.value.toString() })

const details = computed(() => jobSummaryData.value?.results ?? [])

const displaySpecies = computed(() => details.value.slice(displayIndex.value * displayItemNumber, (displayIndex.value * displayItemNumber) + displayItemNumber + 1))

const displaySpeciesColumn1 = computed(() => displaySpecies.value.slice(0, displayItemNumber / 2))
const displaySpeciesColumn2 = computed(() => displaySpecies.value.slice((displayItemNumber / 2) + 1))

const previousPage = () => {
  displayIndex.value -= 1
}

const nextPage = () => {
  displayIndex.value += 1
}

</script>
