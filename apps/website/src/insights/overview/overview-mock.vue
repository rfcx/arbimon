<template>
  <div class="my-10 md:my-20">
    <dashboard-metrics
      :error="isError"
      :loading="isLoading"
      :metrics="metrics"
    />
  </div>
  <dashboard-species />
  <dashboard-project-summary class="my-10 md:my-20" />
  <dashbord-map />
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { computed, inject } from 'vue'

import { apiClientBioKey } from '@/globals'
import { useStore } from '~/store'
import DashbordMap from './components/dashboard-map/dashboard-map.vue'
import DashboardMetrics from './components/dashboard-metrics/dashboard-metrics.vue'
import DashboardProjectSummary from './components/dashboard-project-summary/dashboard-project-summary.vue'
import DashboardSpecies from './components/dashboard-species/dashboard-species.vue'
import { useGetDashboardMetrics } from './composables/use-get-dashboard-metrics'

const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const store = useStore()

const selectedProjectId = computed(() => store.selectedProject?.id)
const { isLoading, isError, data: metrics } = useGetDashboardMetrics(apiClientBio, selectedProjectId)
</script>
