<template>
  <div class="flex items-center justify-between">
    <page-title page-title="CNN Jobs" />
    <router-link :to="{ name: ROUTE_NAMES.cnnJobCreate }">
      <button class="btn btn-primary">
        Create
      </button>
    </router-link>
  </div>
  <table class="w-full text-sm text-left mt-5">
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
import { inject } from 'vue'

import { ClassifierJobAll } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-all'

import { apiClientCoreKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { classifierJobAllGet } from '../_composables/classifier-job'
import JobItemRow from './components/job-item-row.vue'

const apiClientCore = inject(apiClientCoreKey) as AxiosInstance

const allJobs = async (): Promise<ClassifierJobAll> => {
  const result = await classifierJobAllGet(apiClientCore)
  console.info(result)
  return result
}

allJobs()

const jobs = [
  {
    id: '1',
    modelName: 'PR Regional CNN',
    input: {
      sites: 'SR*',
      dateRange: '2022-05-11',
      timeOfDay: 'Diurnal'
    },
    progress: {
      status: 'Processing',
      value: 20
    },
    numberOfRecordings: 4000,
    createdAt: new Date()
  },
  {
    id: '2',
    modelName: 'PR Regional CNN',
    input: {
      sites: 'SR*',
      dateRange: '2022-05-12',
      timeOfDay: 'Diurnal'
    },
    progress: {
      status: 'Queued',
      value: 0
    },
    numberOfRecordings: 2000,
    createdAt: new Date()
  },
  {
    id: '3',
    modelName: 'PR Regional CNN',
    input: {
      sites: 'SR*',
      dateRange: '2022-05-11 - 2022-05-12',
      timeOfDay: 'Nocturnal'
    },
    progress: {
      status: 'Queued',
      value: 0
    },
    numberOfRecordings: 4000,
    createdAt: new Date()
  }
]
</script>
