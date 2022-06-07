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

  import { ROUTE_NAMES } from '~/router'
  import JobItemRow from './components/job-item-row.vue'

  const jobs = [
    {
      id: '1',
      modelName: 'PR Regional CNN',
      input: {
        sites: 'SR1',
        dateRange: '5-11-2022',
        timeOfDay: 'Dirnual'
      },
      progress: {
        status: 'Procressing',
        value: 20
      },
      numberOfRecordings: 4000,
      createdAt: new Date()
    },
    {
      id: '2',
      modelName: 'PR Regional CNN',
      input: {
        sites: 'SR1',
        dateRange: '5-3-2022',
        timeOfDay: 'Dirnual'
      },
      progress: {
        status: 'Queued',
        value: 0
      },
      numberOfRecordings: 2000,
      createdAt: new Date()
    }
  ]
</script>
