<template>
  <!-- TODO: Extract banner states to banner component -->
  <!--
  <div v-if="lastUpdatedAt.isData">
    <draft-banner
      v-if="lastUpdatedAt"
      current-mode="Draft"
      :sync-updated="lastUpdatedAt.data"
      :project-slug="store.selectedProject?.slug"
    />
  </div>
  -->
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
  <div v-if="projectData.isLoading">
    Loading
  </div>
  <div v-else-if="projectData.isError">
    Error
  </div>
  <div v-else-if="projectData.isNoData">
    No Data
  </div>
  <div v-else>
    <filter-list-component
      class="mt-5"
      :can-filter-by-taxon="true"
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
  </div>
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
import { useProjectData } from '~/api/project-service/use-project-data'
import { DetectionFilter, FilterListComponent } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'
import { SpeciesDataset } from './components/activity-overview-by-species/activity-overview-by-species'

const DEFAULT_PREFIX = 'Activity-Overview-Raw-Data'

const route = useRoute()
const projectData = useProjectData()

// const lastUpdatedAt = mapLoadable(projectData, (data): Date | null => data.updatedList[0]?.updatedAt ?? null)

const filters = ref<DetectionFilter[]>([])

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

const onFilterChange = async (newFilters: DetectionFilter[]): Promise<void> => {
  filters.value = newFilters
  await onDatasetChange()
}

const onDatasetChange = async () => {
  const datasets = (await Promise.all(
    filters.value.map(async (filter) => {
      const { dateStartLocal, dateEndLocal, taxonClasses, siteGroups } = filter
      const data = await activityService.getActivityDataset(filter)
      if (!data) return undefined

      return { ...data, dateStartLocal, dateEndLocal, siteGroups, taxonClasses }
    })
  )).filter(isDefined)

  mapDatasets.value = transformToBySiteDatasets(datasets)
  timeDatasets.value = datasets.map(({ activityByTimeHour, activityByTimeDay, activityByTimeMonth, activityByTimeDate }) => {
    const data = {
      hourOfDay: activityByTimeHour,
      dayOfWeek: activityByTimeDay,
      monthOfYear: activityByTimeMonth,
      dateSeries: activityByTimeDate
    }
    return { data }
  })

  tableDatasets.value = datasets.map(({ activityBySpecies }) => ({ data: activityBySpecies }))
  exportDatasets.value = datasets.map(({ activityBySpecies }) => activityBySpecies)
}

const exportSpeciesData = async () => {
  await exportCSV(filters.value, exportDatasets.value, DEFAULT_PREFIX)
}
</script>
