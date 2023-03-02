<template>
  <!-- <draft-banner
    current-mode="Draft"
    :sync-updated="store.projectFilters?.latestSync?.updatedAt ?? null"
    :project-slug="store.selectedProject?.slug"
  /> -->
  <page-title
    page-title="Activity Overview"
    page-subtitle="Temporal and spatial activity trends for all species"
    :topic="infoTopic"
  >
    <export-button
      :disabled="!hasData || !isProjectMember"
      :title="isProjectMember ? (hasData ? '' : 'No data selected') : 'Only available to project members'"
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
  <activity-overview-by-species
    :datasets="tableDatasets"
    :is-location-redacted="isLocationRedacted"
  />
</template>
<script setup lang="ts">
import { AxiosInstance } from 'axios'
import { computed, inject, ref } from 'vue'

import { ActivityOverviewDataBySpecies, apiBioGetActivityDataset } from '@rfcx-bio/common/api-bio/activity/activity-dataset'
import { isDefined } from '@rfcx-bio/utils/predicates'

import ActivityOverviewByLocation from '@/activity-overview/components/activity-overview-by-location/activity-overview-by-location.vue'
import ActivityOverviewBySpecies from '@/activity-overview/components/activity-overview-by-species/activity-overview-by-species.vue'
import ActivityOverviewByTime, { ActivityOverviewTimeDataset } from '@/activity-overview/components/activity-overview-by-time/activity-overview-by-time.vue'
import { exportCSV, transformToBySiteDatasets } from '@/activity-overview/functions'
import { apiClientBioKey } from '@/globals'
import { ColoredFilter, ComparisonListComponent, filterToQuery } from '~/filters'
import { INFO_TOPICS } from '~/info/info-page'
import { MapDataSet } from '~/maps/types'
import { useStore } from '~/store'
import { SpeciesDataset } from './components/activity-overview-by-species/activity-overview-by-species'

const DEFAULT_PREFIX = 'Activity-Overview-Raw-Data'

const store = useStore()
const apiClientBio = inject(apiClientBioKey) as AxiosInstance

const filters = ref<ColoredFilter[]>([])

const mapDatasets = ref<MapDataSet[]>([])
const timeDatasets = ref<ActivityOverviewTimeDataset[]>([])
const tableDatasets = ref<SpeciesDataset[]>([])
const exportDatasets = ref<ActivityOverviewDataBySpecies[][]>([])
const isLocationRedacted = ref<boolean>(true)

const isProjectMember = computed(() => store?.selectedProject?.isMyProject)
const hasData = computed(() => exportDatasets.value.length > 0)
const infoTopic = ref(INFO_TOPICS.activity)

const onFilterChange = async (newFilters: ColoredFilter[]): Promise<void> => {
  filters.value = newFilters
  await onDatasetChange()
}

const onDatasetChange = async () => {
  const projectId = store.selectedProject?.id
  if (projectId === undefined) return

  const datasets = (await Promise.all(
    filters.value.map(async (filter) => {
      const { color, startDate, endDate, otherFilters, sites } = filter
      const data = await apiBioGetActivityDataset(apiClientBio, projectId, filterToQuery(filter))
      if (data === undefined) return undefined

      return { ...data, otherFilters, startDate, endDate, color, sites: sites.flatMap(({ value }) => value) }
    })
  )).filter(isDefined)

  mapDatasets.value = transformToBySiteDatasets(datasets)
  timeDatasets.value = datasets.map(({ color, activityByTimeHour, activityByTimeDay, activityByTimeMonth, activityByTimeDate }) => {
    const data = {
      hourOfDay: activityByTimeHour,
      dayOfWeek: activityByTimeDay,
      monthOfYear: activityByTimeMonth,
      date: activityByTimeDate
    }
    return { color, data }
  })

  tableDatasets.value = datasets.map(({ color, activityBySpecies }) => ({ color, data: activityBySpecies }))
  exportDatasets.value = datasets.map(({ activityBySpecies }) => activityBySpecies)
  isLocationRedacted.value = datasets[0]?.isLocationRedacted ?? true
}

const exportSpeciesData = async () => {
  await exportCSV(filters.value, exportDatasets.value, DEFAULT_PREFIX)
}
</script>
