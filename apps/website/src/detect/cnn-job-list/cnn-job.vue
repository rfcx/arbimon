<template>
  <div class="flex items-center justify-between">
    <page-title page-title="CNN Jobs" />
    <router-link :to="{ name: ROUTE_NAMES.cnnJobCreate }">
      <button class="btn btn-primary">
        Create
      </button>
    </router-link>
  </div>
  <!-- DEBUG START -->
  {{ isLoadingClassifierJobs }}
  {{ isErrorClassifierJobs }}
  {{ classifierJobs }}
  <!-- DEBUG END -->
  <p v-if="isLoadingClassifierJobs">
    Loading...
  </p>
  <p v-else-if="isErrorClassifierJobs">
    Error :(
  </p>
  <table
    v-else
    class="w-full text-sm text-left mt-5"
  >
    <thead class="text-xs text-subtle uppercase">
      <tr class="border-b border-box-grey">
        <th
          scope="col"
          class="px-6 py-3"
        >
          Model
        </th>
        <th
          scope="col"
          class="px-6 py-3"
        >
          Input
        </th>
        <th
          scope="col"
          class="px-6 py-3"
        >
          Date created
        </th>
        <th
          scope="col"
          class="px-6 py-3"
        >
          <span class="sr-only">Status</span>
        </th>
      </tr>
    </thead>
    <!-- <tbody v-if="data?.items">
      <JobItemRow
        v-for="job in data.items"
        :key="job.id"
        :job="jobFormatted(job)"
      />
    </tbody> -->
    <tbody>
      <JobItemRow
        v-for="job in jobs"
        :key="job.id"
        :job="job"
      />
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { AxiosInstance } from 'axios'
import { computed, inject } from 'vue'

// import { ClassifierJob } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-all'
import { apiClientCoreKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useClassifierJobs } from '../_composables/use-classifier-jobs'
import JobItemRow from './components/job-item-row.vue'

const apiClientCore = inject(apiClientCoreKey) as AxiosInstance
const { isLoading: isLoadingClassifierJobs, isError: isErrorClassifierJobs, data: classifierJobs } = useClassifierJobs(apiClientCore)

// TODO: Extract
const getStatus = (s: number): string => {
  switch (s) {
    case 0: return 'Queued'
    case 20: return 'Processing'
    case 30: return 'Done'
    case 40: return 'Error'
    case 50: return 'Cancelled'
    default: return 'Unknown'
  }
}

const getProgress = (minComplete: number, minTotal: number): number =>
  0

const jobs = computed(() => classifierJobs.value?.items?.map(cj => ({
  id: cj.id,
  modelName: cj.classifier.name,
  input: {
    sites: cj.queryStreams,
    dateRange: `${cj.queryStart}-${cj.queryEnd}`,
    timeOfDay: cj.queryHours
  },
  progress: {
    status: getStatus(cj.status),
    value: getProgress(cj.minutesCompleted, cj.minutesTotal)
  },
  numberOfRecordings: 0,
  createdAt: new Date()
})) ?? [])

// const jobFormatted = (job: ClassifierJob): Job => {
//   return {
//     id: job.id,
//     modelName: job.classifier.name,
//     input: {
//       sites: job.queryStreams,
//       dateRange: job.queryStart + (job.queryEnd !== undefined ? (' / ' + job.queryEnd) : ''),
//       timeOfDay: job.queryHours
//     },
//     progress: {
//       status: getStatus(job.status),
//       value: job.status
//     },
//     numberOfRecordings: 4000,
//     createdAt: new Date(job.created_at)
//   }
// }

// const jobs = [
//   {
//     id: 1,
//     modelName: 'PR Regional CNN',
//     input: {
//       sites: 'SR*',
//       dateRange: '2022-05-11',
//       timeOfDay: 'Diurnal'
//     },
//     progress: {
//       status: 'Processing',
//       value: 20
//     },
//     numberOfRecordings: 4000,
//     createdAt: new Date()
//   },
//   {
//     id: 2,
//     modelName: 'PR Regional CNN',
//     input: {
//       sites: 'SR*',
//       dateRange: '2022-05-12',
//       timeOfDay: 'Diurnal'
//     },
//     progress: {
//       status: 'Queued',
//       value: 0
//     },
//     numberOfRecordings: 2000,
//     createdAt: new Date()
//   },
//   {
//     id: 3,
//     modelName: 'PR Regional CNN',
//     input: {
//       sites: 'SR*',
//       dateRange: '2022-05-11 - 2022-05-12',
//       timeOfDay: 'Nocturnal'
//     },
//     progress: {
//       status: 'Queued',
//       value: 0
//     },
//     numberOfRecordings: 4000,
//     createdAt: new Date()
//   }
// ]
</script>
