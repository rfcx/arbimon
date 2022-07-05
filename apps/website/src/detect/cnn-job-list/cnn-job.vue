<template>
  <div class="flex items-center justify-between">
    <page-title page-title="CNN Jobs" />
    <router-link :to="{ name: ROUTE_NAMES.cnnJobCreate }">
      <button class="btn btn-primary">
        Create
      </button>
    </router-link>
  </div>

  <job-filter
    :filter-options="filterOptions"
    @emit-select="onFilterChange"
  />
  <p v-if="isLoadingClassifierJobs">
    Loading...
  </p>
  <p v-else-if="isErrorClassifierJobs">
    Error getting a list of classifier jobs
  </p>
  <div
    v-else-if="jobs && !jobs.length"
    class="mt-5 text-lg"
  >
    <span>No jobs found.</span>
    &nbsp;
    <router-link
      :to="{ name: ROUTE_NAMES.cnnJobCreate }"
      class="font-bold underline"
    >
      Create now
    </router-link>
  </div>
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
    <tbody>
      <job-item-row
        v-for="job in jobs"
        :key="'job-item-row-' + job.id"
        :job="job"
      />
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { AxiosInstance } from 'axios'
import { computed, inject, onBeforeUnmount, onMounted, reactive } from 'vue'
import { useQueryClient } from 'vue-query'

import { CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

import { apiClientCoreKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { FETCH_CLASSIFIER_JOBS_KEY, useClassifierJobs } from '../_composables/use-classifier-jobs'
import { JobFilterItem } from '../types'
import JobFilter from './components/job-filter.vue'
import JobItemRow from './components/job-item-row.vue'

const apiClientCore = inject(apiClientCoreKey) as AxiosInstance

const params = reactive({ created_by: 'all' })

const { isLoading: isLoadingClassifierJobs, isError: isErrorClassifierJobs, data: classifierJobs } = useClassifierJobs(apiClientCore, params)

const filterOptions: JobFilterItem[] = [
  { value: 'me', label: 'My jobs', checked: false },
  { value: 'all', label: 'All jobs', checked: true }
]

const jobs = computed(() => classifierJobs.value?.items?.map(cj => ({
  id: cj.id,
  modelName: cj.classifier.name,
  input: {
    sites: cj.queryStreams !== null ? cj.queryStreams : 'All sites',
    dateRange: `${cj.queryStart !== null ? cj.queryStart : ''} / ${cj.queryEnd !== null ? cj.queryEnd : '-'}`,
    timeOfDay: cj.queryHours !== null ? cj.queryHours : 'All day'
  },
  progress: {
    status: cj.status,
    value: getProgress(cj.minutesCompleted, cj.minutesTotal)
  },
  numberOfRecordings: 0,
  createdAt: new Date(cj.created_at)
})) ?? [])

const getProgress = (minutesComplete: number, minutesTotal: number): number => {
  if (minutesTotal === null || minutesTotal === 0) return 0.0
  return Math.round((minutesComplete / minutesTotal) * 100 * 10) / 10
}

const onFilterChange = (filter: string): void => {
  params.created_by = filter === 'me' ? 'me' : 'all'
}

const queryClient = useQueryClient()
const pollingJob = setInterval(() => {
  queryClient.invalidateQueries(FETCH_CLASSIFIER_JOBS_KEY)
}, 1 * 60 * 1000) // 1 minute
const pollJob = () => pollingJob

onMounted(() => {
  if (jobs.value.some(job => [CLASSIFIER_JOB_STATUS.WAITING, CLASSIFIER_JOB_STATUS.RUNNING].includes(job.progress.status))) {
    pollJob()
  }
})

onBeforeUnmount(() => {
  clearInterval(pollingJob)
})

</script>
