<template>
  <div class="mb-10 md:mb-20">
    <dashboard-metrics
      :error="isError"
      :loading="isLoading"
      :metrics="metrics"
    />
  </div>
  <dashboard-species />
  <dashboard-project-summary />
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { inject } from 'vue'

import { apiClientBioKey } from '@/globals'
import { useStore } from '~/store'
import DashboardMetrics from './components/dashboard-metrics/dashboard-metrics.vue'
import DashboardProjectSummary from './components/dashboard-project-summary/dashboard-project-summary.vue'
import DashboardSpecies from './components/dashboard-species/dashboard-species.vue'
import { useGetDashboardMetrics } from './composables/use-get-dashboard-metrics'

const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const store = useStore()

const { isLoading, isError, data: metrics } = useGetDashboardMetrics(apiClientBio, store.selectedProject?.id ?? -1)
</script>
