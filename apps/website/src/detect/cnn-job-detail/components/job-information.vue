<template>
  <div class="job-information-wrapper border-1 border-box-grey rounded-md">
    <div class="p-6">
      <p class="flex text-3xl font-header text-insight">
        Summary
      </p>
      <div class="grid grid-cols-2 text-lg py-4 border-b-1 border-util-gray-03">
        <div class="flex">
          <span class="text-util-gray-01">Model:</span>
          <div class="ml-2 text-insight">
            <h5>
              {{ props.summary?.classifier.name ?? 'asian-elephant-edge' }}
            </h5>
            <h5>
              {{ props.summary?.classifier.version != null ? `v${props.summary?.classifier.version}` : '' }}
            </h5>
          </div>
        </div>
        <div>
          <h2 class="text-lg">
            <jobInformationStatus
              :variant="props.summary?.status ?? 0"
              :progress="progress"
            />
          </h2>
        </div>
      </div>
      <div class="grid grid-cols-3 pt-4 text-lg">
        <div>
          <span class="text-util-gray-01">Input</span>
          <div
            id="cnn-job-information-input"
            class="grid grid-rows-4 gap-y-4 mt-4 text-base text-insight"
          >
            <icon-custom-ft-map-pin-lg-frequency class="block m-auto" />
            <span
              class="truncate ml-2"
              :title="queryStreamsInfoString"
            >
              {{ queryStreamsInfoString }}
            </span>
            <icon-custom-ic-calendar-frequency class="block m-auto" />
            <span class="ml-2">
              {{ queryStart }} - {{ queryEnd }}
            </span>
            <icon-custom-ic-clock-frequency class="block m-auto" />
            <span class="ml-2">
              {{ queryHours }}
            </span>
            <icon-custom-ft-mic-lg-frequency class="block m-auto" />
            <span class="ml-2">
              {{ minOfRecordings }}
            </span>
          </div>
        </div>
        <div>
          <span class="text-util-gray-01">Validation Status</span>
          <job-result-validation-status
            :is-loading="props.isLoadingResults"
            :is-error="props.isErrorResults"
            :data="props.results"
          />
        </div>
        <div>
          <span class="text-util-gray-01">Output</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed } from 'vue'

import type { DetectSummaryResponse } from '@rfcx-bio/common/api-bio/detect/detect-summary'
import type { DetectValidationResultsResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation-results'
import { CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

import { hours } from '~/picker/time-of-day-constants'
import { useStore } from '~/store'
import jobInformationStatus from './job-information-status.vue'
import JobResultValidationStatus from './job-result-validation-status.vue'

const props = withDefaults(defineProps<{ isLoadingSummary: boolean, isErrorSummary: boolean, summary: DetectSummaryResponse | undefined, isLoadingResults: boolean, isErrorResults: boolean, results: DetectValidationResultsResponse | undefined }>(), {
  isLoadingSummary: true,
  isLoadingResults: true,
  isErrorResults: false,
  data: undefined,
  results: undefined
})

const store = useStore()

const queryStart = computed(() => {
  if (props.summary?.queryStart == null) {
    return ''
  }

  return dayjs(props.summary.queryStart).format('YYYY/MM/DD')
})

const queryEnd = computed(() => {
  if (props.summary?.queryEnd == null) {
    return ''
  }

  return dayjs(props.summary.queryEnd).format('YYYY/MM/DD')
})

const queryStreams = computed(() => {
  if (props.summary?.queryStreams == null) {
    return 'All sites'
  }

  return props.summary.queryStreams
})

const sitesCount = computed(() => {
  if (props.summary?.streams == null || props.summary?.streams.length === 0) {
    return store.projectFilters?.locationSites.length ?? 0
  }

  return props.summary.streams.length
})

const queryStreamsInfoString = computed(() => {
  return `${queryStreams.value} (${sitesCount.value} sites)`
})

const minOfRecordings = computed(() => {
  if (props.summary?.minutesTotal === undefined || props.summary?.minutesTotal === 0 || props.summary?.minutesTotal === 1) return '0 min of recordings'
  if (props.summary?.minutesTotal === 1) return '1 min of recordings'
  return `${props.summary?.minutesTotal} mins of recordings`
})

const queryHours = computed(() => {
  if (props.summary?.queryHours == null) {
    return 'All day'
  }

  const values = Object.values(hours)
  const found = values.find(v => v.value === props.summary?.queryHours)

  if (found != null) {
    return found.label
  }

  return props.summary.queryHours
})

// const validationStatus = computed(() => {
//   const processed = (props.results?.reviewStatus.confirmed ?? 0) + (props.results?.reviewStatus.rejected ?? 0) + (props.results?.reviewStatus.uncertain ?? 0)
//   return `${processed}/${props.results?.reviewStatus.total ?? 0}`
// })

/**
 * Returns the progress of the bar calculated from `minutesCompleted` and `minutesTotal`.
 *
 * - will return 0 for jobs with status `WAITING` regardless of the computed value
 * - will return 100 for jobs with status `DONE` regardless of the computed value
 * - will return computed value capped at 100 for other statuses
 */
const progress = computed(() => {
  if (props.summary?.minutesTotal === null || props.summary?.minutesTotal === 0) {
    return 0.0
  }

  if (props.summary?.status === CLASSIFIER_JOB_STATUS.WAITING) {
    return 0.0
  }

  if (props.summary?.status === CLASSIFIER_JOB_STATUS.DONE) {
    return 100.0
  }

  const rounded = Math.round(((props.summary?.minutesCompleted ?? 0) / (props.summary?.minutesTotal ?? 0)) * 100 * 10e1) / 10e1
  return rounded > 100 ? 100.0 : rounded
})

</script>

<style lang="scss">
div#cnn-job-information-input {
  grid-template-columns: 1.5rem 1fr;
}

div#cnn-job-information-status {
  grid-template-columns: 1.5rem 1fr;
}

// <lg equivalent
@media (max-width: 1024px) {
  div#job-information-summary-grid {
    grid-template-rows: fit-content(4rem) 1fr 1fr 1fr;
  }
}

div#job-information-status-progress-bar {
  div.el-progress-bar {
    div.el-progress-bar__outer {
      background-color: #45485D;
    }
  }
}
</style>
