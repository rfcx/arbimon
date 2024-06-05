<template>
  <h1 class="flex text-insight mt-5">
    Summary
  </h1>
  <div class="grid grid-cols-3 text-lg py-4 border-b-1 border-util-gray-03 items-center">
    <div class="flex md:col-span-1 <md:col-span-2 items-center">
      <span class="text-util-gray-01 font-medium">Model:</span>
      <h5 class="break-all mx-2 text-insight">
        {{ props.summary?.classifier.name ?? '' }} {{ props.summary?.classifier.version != null ? `v${props.summary?.classifier.version}` : '' }}
      </h5>
    </div>
    <div
      v-if="props.isLoadingSummary"
      class="mr-2 my-4 loading-shimmer w-full rounded-lg pt-4 max-w-64"
    />
    <div
      v-else
      class="md:(col-span-1 mt-1) <md:(col-span-3 mt-4)"
    >
      <div class="text-lg">
        <job-progress
          :status="props.summary?.status ?? 0"
          :current="progress"
          :total="100"
        />
      </div>
    </div>
    <div />
  </div>
  <div class="grid grid-cols-3 pt-4 text-lg border-b-1 border-util-gray-03 pb-6">
    <div class="lg:(col-span-1) <lg:(col-span-3)">
      <span class="text-util-gray-01 font-medium">Input</span>
      <div
        v-if="props.isLoadingSummary"
        class="mx-2 mt-4 loading-shimmer w-full rounded-lg py-15 max-w-64"
      />
      <ComponentError
        v-else-if="props.isErrorSummary"
        class="mx-2 mt-4"
      />
      <div
        v-else
        id="cnn-job-information-input"
        class="grid grid-rows-4 gap-y-4 mt-4 text-base text-insight mr-4"
      >
        <div
          title="Sites"
          class="flex items-center w-4"
        >
          <icon-custom-ft-map-pin class="block m-auto text-cloud" />
        </div>
        <span
          class="truncate"
          :title="queryStreamsInfoString"
        >
          {{ queryStreamsInfoString }}
        </span>
        <div
          title="Date"
          class="flex items-center w-3.5"
        >
          <icon-custom-ic-calendar class="block m-auto text-cloud" />
        </div>
        <span
          :title="queryStart + ' - ' + queryEnd"
        >
          {{ queryStart }} - {{ queryEnd }}
        </span>
        <div
          title="Time of day"
          class="flex items-center w-4.5"
        >
          <icon-custom-ic-clock class="block m-auto text-cloud" />
        </div>
        <span
          :title="queryHours"
        >
          {{ queryHours }}
        </span>
        <div
          title="Minutes of recordings"
          class="flex items-center w-4"
        >
          <icon-custom-ft-mic class="block m-auto text-cloud" />
        </div>
        <span
          :title="minOfRecordings"
        >
          {{ minOfRecordings }}
        </span>
      </div>
    </div>
    <div class="lg:(col-span-1) <lg:(col-span-3 mt-6)">
      <span class="text-util-gray-01 font-medium">Validation Status</span>
      <job-result-validation-status
        :is-loading="props.isLoadingSummary"
        :is-error="props.isErrorSummary"
        :data="props.summary?.validationStatus"
      />
    </div>
    <div class="lg:(col-span-1) <lg:(col-span-3 mt-6)">
      <span class="text-util-gray-01 font-medium">Output</span>
      <div
        v-if="props.isLoadingSummary"
        class="m-2 mt-4 loading-shimmer w-full rounded-lg py-4 max-w-64"
      />
      <ComponentError
        v-else-if="props.isErrorSummary"
        class="mx-2 mt-4"
      />
      <span
        v-else
        class="flex text-base text-insight mt-4"
      >
        Total number of detected classes: {{ props.summary?.totalDistinctClassifications }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed } from 'vue'

import type { GetClassifierJobInformationResponse } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'
import { CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

import jobProgress from '@/detect/cnn-job-list/components/job-progress.vue'
import { hours } from '~/picker/time-of-day-constants'
import { useStore } from '~/store'
import ComponentError from './component-error.vue'
import JobResultValidationStatus from './job-result-validation-status.vue'

const props = withDefaults(defineProps<{ isLoadingSummary: boolean, isErrorSummary: boolean, summary: GetClassifierJobInformationResponse | undefined}>(), {
  isLoadingSummary: false
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
  if (props.summary?.minutesTotal === undefined || props.summary?.minutesTotal === 0) return '0 min of recordings'
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
