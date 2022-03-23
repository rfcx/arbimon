<template>
  <page-title
    page-title="Activity Overview"
    page-subtitle="Temporal and spatial activity trends for all species"
    :topic="infoTopic"
  >
    <export-button
      :disabled="!hasData"
      :title="hasData ? '' : 'No data selected'"
      @click="exportSpeciesData()"
    >
      <template #label>
        <div class="ml-2 <md:hidden">
          Download Source
        </div>
        <div class="ml-2 md:hidden">
          Source
        </div>
      </template>
    </export-button>
  </page-title>
  <comparison-list-component
    class="mt-5"
    @emit-select="onFilterChange"
  />
  <activity-overview-by-location
    class="mt-5"
    :datasets="mapDatasets"
  />
  <activity-overview-by-time
    class="mt-5"
    dom-id="activity-overview-by-time"
    :datasets="timeDatasets"
  />
  <activity-overview-by-species :datasets="tableDatasets" />
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { ActivityOverviewDataBySpecies } from '@rfcx-bio/common/api-bio/activity/activity-dataset'
import { isDefined } from '@rfcx-bio/utils/predicates'

import ActivityOverviewByLocation from '@/activity-overview/components/activity-overview-by-location/activity-overview-by-location.vue'
import ActivityOverviewBySpecies from '@/activity-overview/components/activity-overview-by-species/activity-overview-by-species.vue'
import ActivityOverviewByTime, { ActivityOverviewTimeDataset } from '@/activity-overview/components/activity-overview-by-time/activity-overview-by-time.vue'
import { exportCSV, transformToBySiteDatasets } from '@/activity-overview/functions'
import { activityService } from '@/activity-overview/services'
import { INFO_TOPICS } from '@/info/info-page'
import { ColoredFilter, ComparisonListComponent, filterToDataset } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'
import { SpeciesDataset } from './components/activity-overview-by-species/activity-overview-by-species'

const DEFAULT_PREFIX = 'Activity-Overview-Raw-Data'

const route = useRoute()

const filters = ref<ColoredFilter[]>([])

const mapDatasets = ref<MapDataSet[]>([])
const timeDatasets = ref<ActivityOverviewTimeDataset[]>([])
const tableDatasets = ref<SpeciesDataset[]>([])
const exportDatasets = ref<ActivityOverviewDataBySpecies[][]>([])

const hasData = computed(() => exportDatasets.value.length > 0)
const infoTopic = ref(INFO_TOPICS.activity)

watch(() => route.params.projectSlug, async (toProjectSlug, fromProjectSlug) => {
  if (toProjectSlug !== fromProjectSlug) {
    await onDatasetChange()
  }
})

const onFilterChange = async (newFilters: ColoredFilter[]): Promise<void> => {
  filters.value = newFilters
  await onDatasetChange()
}

const onDatasetChange = async () => {
  const datasets = (await Promise.all(
    filters.value.map(async (filter) => {
      const { color, startDate, endDate, otherFilters, sites } = filter
      const data = await activityService.getActivityDataset(filterToDataset(filter))
      if (!data) return undefined

      return { ...data, otherFilters, startDate, endDate, color, sites: sites.flatMap(({ value }) => value) }
    })
  )).filter(isDefined)

  mapDatasets.value = transformToBySiteDatasets(datasets)
  timeDatasets.value = datasets.map(({ color, detectionsByTimeDay, detectionsByTimeHour, detectionsByTimeMonth, detectionsByTimeDate }) => {
    const data = {
      hourOfDay: detectionsByTimeHour,
      dayOfWeek: detectionsByTimeDay,
      monthOfYear: detectionsByTimeMonth,
      dateSeries: detectionsByTimeDate
    }
    return { color, data }
  })

  tableDatasets.value = datasets.map(({ color, detectionsBySpecies }) => ({ color, data: detectionsBySpecies }))
  exportDatasets.value = datasets.map(({ detectionsBySpecies }) => detectionsBySpecies)
}

const exportSpeciesData = async () => {
  await exportCSV(filters.value, exportDatasets.value, DEFAULT_PREFIX)
}
</script>
