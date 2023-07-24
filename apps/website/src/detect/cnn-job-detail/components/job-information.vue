<template>
  <div class="job-information-wrapper border-1 border-box-grey rounded-md">
    <div
      id="job-information-summary-grid"
      class="grid lg:grid-cols-4 lg:gap-x-4 <lg:gap-y-4 px-6 py-4"
    >
      <div
        v-if="props.isLoadingSummary"
        class="loading-shimmer mx-2 rounded-lg"
      />
      <ComponentError v-else-if="props.isErrorSummary" />
      <div v-else>
        <span class="text-subtle ">Model</span>
        <h2 class="text-lg">
          {{ props.summary?.classifier.name ?? '' }}
        </h2>
      </div>

      <div
        v-if="props.isLoadingSummary"
        class="loading-shimmer mx-2 rounded-lg"
      />
      <ComponentError v-else-if="props.isErrorSummary" />
      <div v-else>
        <span class="text-subtle">Input</span>
        <div
          id="cnn-job-information-input"
          class="grid grid-rows-3 gap-y-1"
        >
          <icon-fa-map-marker class="block m-auto" />
          <h2
            class="text-lg truncate"
            :title="props.summary?.queryStreams ?? ''"
          >
            {{ props.summary?.queryStreams == null ? 'All sites' : props.summary.queryStreams }}
          </h2>
          <icon-fa-calendar class="block m-auto" />
          <h2 class="text-lg">
            {{ queryStart }} - {{ queryEnd }}
          </h2>
          <icon-fas-clock class="block m-auto" />
          <h2 class="text-lg">
            {{ queryHours }}
          </h2>
        </div>
      </div>

      <div
        v-if="props.isLoadingSummary"
        class="loading-shimmer mx-2 rounded-lg"
      />
      <ComponentError v-else-if="props.isErrorSummary" />
      <div v-else>
        <span class="text-subtle">Status</span>
        <div
          id="cnn-job-information-status"
          class="grid grid-rows-3"
        >
          <div class="my-auto w-6">
            <jobInformationStatus :variant="props.summary?.status ?? 0" />
          </div>
          <h2 class="text-lg">
            {{ CLASSIFIER_JOB_LABELS[props.summary?.status ?? 0] }}
          </h2>
          <el-progress
            id="job-information-status-progress-bar"
            class="col-span-2"
            color="#232436"
            :stroke-width="12"
            :percentage="progress"
            :format="progressFormat"
          />
          <!-- TODO: we're droppping this UI out for now as we don't have good ways of looking up this data -->
          <!-- <div class="flex flex-row col-span-2"> -->
          <!--   <icon-fa-calendar class="block mr-2" /> -->
          <!--   <h3 class="text-md text-subtle"> -->
          <!--     Jun 29, 2022 13:24 - Tomaz -->
          <!--   </h3> -->
          <!-- </div> -->
        </div>
      </div>

      <div
        v-if="props.isLoadingResults"
        class="loading-shimmer mx-2 rounded-lg"
      />
      <ComponentError v-else-if="props.isErrorResults" />
      <div>
        <span class="text-subtle">Validation Status</span>
        <h2 class="text-lg">
          {{ validationStatus }}
        </h2>
        <!-- TODO: we're droppping this UI out for now as we don't have good ways of looking up this data -->
        <!-- <div class="flex flex-row mt-2"> -->
        <!--   <icon-fa-calendar class="block mr-2" /> -->
        <!--   <h3 class="text-md text-subtle"> -->
        <!--     Rreviewed 3 hours ago by Gabriel -->
        <!--   </h3> -->
        <!-- </div> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed } from 'vue'

import type { DetectSummaryResponse } from '@rfcx-bio/common/api-bio/detect/detect-summary'
import type { DetectValidationResultsResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation-results'
import { CLASSIFIER_JOB_LABELS, CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

import { hours } from '~/picker/time-of-day-constants'
import ComponentError from './component-error.vue'
import jobInformationStatus from './job-information-status.vue'

const props = withDefaults(defineProps<{ isLoadingSummary: boolean, isErrorSummary: boolean, summary: DetectSummaryResponse | undefined, isLoadingResults: boolean, isErrorResults: boolean, results: DetectValidationResultsResponse | undefined }>(), {
  isLoadingSummary: true,
  isLoadingResults: true,
  data: undefined,
  results: undefined
})

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

const validationStatus = computed(() => {
  const processed = (props.results?.reviewStatus.confirmed ?? 0) + (props.results?.reviewStatus.rejected ?? 0) + (props.results?.reviewStatus.uncertain ?? 0)
  return `${processed}/${props.results?.reviewStatus.total ?? 0}`
})

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

/**
 * Returns the end text of the progress bar
 *
 * - will return `''` for jobs with status `WAITING` regardless of the computed value
 * - will return `100%` for jobs with status `DONE` regardless of the computed value
 * - will return actual value for other statuses
 */
const progressFormat = (percentage: number) => {
  if (props.summary?.status === CLASSIFIER_JOB_STATUS.WAITING) {
    return ''
  }

  if (props.summary?.status === CLASSIFIER_JOB_STATUS.DONE) {
    return '100%'
  }
  return `${percentage}%`
}
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
    grid-template-rows: fit-content 1fr 1fr 1fr;
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
