<template>
  <div
    v-if="metrics === undefined"
    class="metric_wrapper"
  >
    <div class="loading-shimmer rounded-xl p-4 min-w-32 inline-block <sm:min-w-24">
      <p class="font-bold text-4xl <sm:text-2xl">
        &nbsp;
      </p>
      <p>&nbsp;</p>
    </div>
    <div class="loading-shimmer rounded-xl p-4 min-w-32 inline-block <sm:min-w-24" />
    <div class="loading-shimmer rounded-xl p-4 min-w-32 inline-block <sm:min-w-24" />
  </div>
  <div
    v-else
    class="metric_wrapper <sm:text-center"
  >
    <numeric-metric
      :value="metrics.detectionMinutesCount"
      subtitle="detections"
      class="detections_metric"
    />
    <numeric-metric
      class="sites_metric"
      :value="metrics.siteCount"
      subtitle="sites"
    />
    <numeric-metric
      class="threatened_metric"
      :value="dashboardStore.speciesThreatenedCount"
      :total-value="metrics.speciesCount"
      subtitle="threatened"
    />
  </div>
  <div
    class="text-center text-subtle sm:(mt-3 text-left)"
  >
    Recording dates:
    <span v-if="metrics === undefined" />
    <span v-else-if="metrics.minDate || metrics.maxDate">{{ formatDateRange(metrics.minDate, metrics.maxDate) }}</span>
    <span v-else>-</span>
  </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { apiBioGetDashboardMetrics } from '@rfcx-bio/common/api-bio/dashboard/dashboard-metrics'

import NumericMetric from '@/_components/numeric-metric.vue'
import { apiClientBioKey, storeKey } from '@/globals'
import type { BiodiversityStore } from '~/store'
import { useDashboardStore } from '~/store/use-dashboard-store'
import useDateFormat from '../../../_services/hooks/use-date-format'

const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const store = inject(storeKey) as BiodiversityStore
const route = useRoute()
const dashboardStore = useDashboardStore()

const { formatDateRange } = useDateFormat()

const metrics = ref(await apiBioGetDashboardMetrics(apiClientBio, store.selectedProject?.id ?? -1))
dashboardStore.updateSpeciesCount(metrics.value?.speciesCount ?? '0')

watch(() => route.params.projectSlug, async (newRoute, oldRoute) => {
  if (newRoute !== oldRoute) {
    metrics.value = await apiBioGetDashboardMetrics(apiClientBio, store?.selectedProject?.id ?? -1)
    dashboardStore.updateSpeciesCount(metrics.value?.speciesCount ?? '0')
  }
})
</script>

<style lang="scss">
.metric_wrapper {
  display: grid;
  grid-gap: 1rem;
  grid-template-areas:
    "detections_metric sites_metric threatened_metric dataset_range";
  grid-template-columns: min(8rem) min(8rem) min(8rem) 1fr;

  @media (max-width: 700px) {
    place-content: center;
    grid-template-areas:
    "detections_metric sites_metric threatened_metric"
    "dataset_range dataset_range dataset_range";
    grid-template-columns: repeat(3, min(8rem));
    grid-template-rows: auto;
  }

  .detections_metric {
    grid-area: detections_metric;
  }

  .sites_metric {
    grid-area: sites_metric;
  }

  .threatened_metric {
    grid-area: threatened_metric;
  }

  .dataset_range {
    grid-area: dataset_range;
    justify-self: end;
    text-align: end;

    span {
      display: inline-block;
      padding: .25rem 0;
    }

    @media (max-width: 700px) {
      justify-self: center;
      text-align: center;
      margin: 0;

      span {
        padding: 0;
      }

      p {
        display: inline-block;
        padding-left: .5rem;
      }
    }
  }

}
</style>
