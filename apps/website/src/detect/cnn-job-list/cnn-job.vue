<template>
  <section class="pt-22 pl-115px pr-40 4xl:(pr-16)">
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
        <tr class="border-b border-box-gray">
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
  </section>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import dayjs from 'dayjs'
import { computed, inject, reactive, ref, watch } from 'vue'

import { CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

import { apiClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import { useClassifierJobs } from '../_composables/use-classifier-jobs'
import type { Job, JobFilterItem } from '../types'
import JobFilter from './components/job-filter.vue'
import JobItemRow from './components/job-item-row.vue'

const apiClient = inject(apiClientKey) as AxiosInstance

const store = useStore()

const params = reactive<{projectId: string, createdBy: 'all' | 'me'}>({
  projectId: store.project?.idCore ?? '',
  createdBy: 'all'
})

watch(() => store.project, () => {
  params.projectId = store.project?.idCore ?? ''
})

const refetchInterval = ref<number | false>(false)

const { isLoading: isLoadingClassifierJobs, isError: isErrorClassifierJobs, data: classifierJobs } = useClassifierJobs(apiClient, params, refetchInterval)

const filterOptions: JobFilterItem[] = [
  { value: 'me', label: 'My jobs', checked: false },
  { value: 'all', label: 'All jobs', checked: true }
]

const getProgress = (minutesComplete: number, minutesTotal: number): number => {
  if (minutesTotal === null || minutesTotal === 0) return 0.0
  return Math.round((minutesComplete / minutesTotal) * 100 * 10) / 10
}

const jobs = computed((): Job[] => classifierJobs.value?.map(cj => ({
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
  totalDurationMinutes: cj.minutesTotal || 0,
  createdAt: dayjs(cj.createdAt)
})) ?? [])

watch(jobs, () => {
  const hasRunningJobs = jobs.value.some(job => job.progress.status === CLASSIFIER_JOB_STATUS.WAITING || job.progress.status === CLASSIFIER_JOB_STATUS.RUNNING)
  refetchInterval.value = hasRunningJobs ? 1 * 60 * 1000 : false
})

const onFilterChange = (filter: string): void => {
  params.createdBy = filter === 'me' ? 'me' : 'all'
}

</script>
