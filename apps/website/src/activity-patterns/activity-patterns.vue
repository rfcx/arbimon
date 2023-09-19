<template>
  <div>
    <!-- <draft-banner
      current-mode="Draft"
      :sync-updated="store.projectFilters?.latestSync?.updatedAt ?? null"
      :project-slug="store.selectedProject?.slug"
    /> -->
    <page-title
      page-title="Species Spotlight"
      page-subtitle="An in-depth look at the detection and occupancy trends of a single species"
      :topic="infoTopic"
    >
      <export-button
        :disabled="!hasExportData || !isProjectMember"
        :title="isProjectMember ? (hasExportData ? '' : 'No data selected') : 'Only available to project members'"
        @click="exportDetectionsData()"
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
      :can-filter-by-taxon="false"
      @emit-select="onFilterChange"
    />
    <species-selector
      :species-slug="slug"
      @emit-selected-species-change="onSelectedSpeciesChange"
    />
    <species-title
      :species="speciesInformation"
      :loading="loadingSpecies"
    />
    <div class="grid grid-cols-5 gap-x-2rem">
      <div class="col-span-full lg:col-span-2">
        <species-images
          :species-photos="speciesPhotos"
          :loading="loadingSpecies"
        />
        <spotlight-player
          :species-calls="speciesCalls"
          :loading="loadingSpecies"
          class="mt-4"
        />
        <species-background-information
          :species-information="speciesInformation"
          :loading="loadingSpecies"
          class="my-4"
        />
      </div>
      <div class="col-span-full lg:col-span-3">
        <spotlight-metrics
          :metrics="metrics"
          :loading="loadingDatasets"
        />
        <location-redacted-banner
          v-if="isLocationRedacted && !loadingDatasets"
          class="mt-4"
        />
        <activity-patterns-by-location
          v-else
          :datasets="mapDatasets"
          :loading="loadingDatasets"
          :species="species"
          class="mt-4"
        />
        <activity-patterns-predicted-occupancy
          :species-slug="slug"
          :predicted-occupancy-maps="predictedOccupancyMaps"
          class="mt-4"
        />
        <activity-patterns-by-time
          dom-id="activity-by-time"
          :species="species"
          :datasets="timeDatasets"
          :loading="loadingDatasets"
          class="my-4"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { type Ref, computed, inject, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { PredictedOccupancyMap } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { apiBioGetProjectSpeciesOne } from '@rfcx-bio/common/api-bio/species/project-species-one'
import type { SpotlightDataByTime, SpotlightExportData } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'
import { apiBioGetSpotlightDataset } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'
import { type TaxonSpeciesCallTypes, type TaxonSpeciesPhotoTypes } from '@rfcx-bio/common/dao/types'
import type { SpeciesInProjectTypes } from '@rfcx-bio/common/dao/types/species-in-project'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { apiClientBioKey } from '@/globals'
import type { ColoredFilter } from '~/filters'
import { filterToQuery } from '~/filters'
import ComparisonListComponent from '~/filters/comparison-list/comparison-list.vue'
import { INFO_TOPICS } from '~/info/info-page'
import type { MapDataSet } from '~/maps/types'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import ActivityPatternsByLocation from './components/activity-patterns-by-location/activity-patterns-by-location.vue'
import ActivityPatternsByTime from './components/activity-patterns-by-time/activity-patterns-by-time.vue'
import type { SpotlightTimeDataset } from './components/activity-patterns-by-time/types'
import ActivityPatternsPredictedOccupancy from './components/activity-patterns-predicted-occupancy/activity-patterns-predicted-occupancy.vue'
import SpeciesBackgroundInformation from './components/species-background-information/species-background-information.vue'
import SpeciesImages from './components/species-images/species-images.vue'
import SpeciesSelector from './components/species-selector/species-selector.vue'
import SpeciesTitle from './components/species-title/species-title.vue'
import SpotlightMetrics from './components/spotlight-metrics/spotlight-metrics.vue'
import SpotlightPlayer from './components/spotlight-player/spotlight-player.vue'
import { exportDetectionCSV, transformToBySiteDataset, transformToMetricsDatasets } from './functions'
import type { Metrics } from './types'

const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const store = useStore()
const route = useRoute()
const router = useRouter()

const DEFAULT_PREFIX = 'Spotlight-Raw-Data'

// Dataset definitions
const species: Ref<SpeciesInProjectTypes['light'] | null> = ref(null)
const filters: Ref<ColoredFilter[]> = ref([])

// Data for children
const loadingDatasets: Ref<boolean> = ref(true)
const loadingSpecies: Ref<boolean> = ref(true)
const predictedOccupancyMaps: Ref<PredictedOccupancyMap[]> = ref([])
const metrics: Ref<Metrics[]> = ref([])
const mapDatasets: Ref<MapDataSet[]> = ref([])
const timeDatasets: Ref<SpotlightTimeDataset[]> = ref([])
const exportDatasets: Ref<SpotlightExportData[]> = ref([])
const speciesInformation: Ref<SpeciesInProjectTypes['light'] | null> = ref(null)
const speciesCalls: Ref<Array<TaxonSpeciesCallTypes['light']> > = ref([])
const speciesPhotos: Ref<Array<TaxonSpeciesPhotoTypes['light']>> = ref([])
const isLocationRedacted: Ref<boolean> = ref(false)

const isProjectMember = computed(() => {
  return store.selectedProject?.isMyProject ?? false
})

const hasExportData = computed(() => {
  return timeDatasets.value.length > 0
})

const infoTopic = computed(() => {
  return INFO_TOPICS.spotlight
})

const slug = computed(() => {
  return typeof route.params.speciesSlug === 'string' ? route.params.speciesSlug : ''
})

const onSelectedSpeciesChange = async (givenSpecies: SpeciesInProjectTypes['light'] | undefined): Promise<void> => {
  const speciesSlug = givenSpecies?.taxonSpeciesSlug
  void router.replace({ name: ROUTE_NAMES.activityPatterns, params: { speciesSlug }, query: route.query })

  species.value = givenSpecies ?? null

  await Promise.all([
    onDatasetChange(),
    getSpeciesInformation()
  ])
}

const onFilterChange = async (givenFilters: ColoredFilter[]): Promise<void> => {
  filters.value = givenFilters

  await onDatasetChange()
}

const onDatasetChange = async (): Promise<void> => {
  const projectId = store.selectedProject?.id

  if (projectId == null) {
    return
  }

  // TODO 117 - Only update the changed dataset
  const speciesId = species.value?.taxonSpeciesId ?? NaN

  if (!speciesId) {
    return
  }

  loadingDatasets.value = true
  mapDatasets.value = filters.value.map(filter => ({ ...filter, sites: [], data: [], maxValues: {} }))

  const datasetsResponse = await Promise.all(
    filters.value.map(async filter => {
      const { color, startDate, endDate, sites, otherFilters } = filter
      const data = await apiBioGetSpotlightDataset(apiClientBio, projectId, speciesId, filterToQuery(filter))
      return data ? { ...data, startDate, endDate, color, sites: sites.flatMap(({ value }) => value), otherFilters } : data
    })
  )
  const datasets = datasetsResponse.filter(isDefined)

  isLocationRedacted.value = datasets[0]?.isLocationRedacted ?? true
  metrics.value = transformToMetricsDatasets(datasets)
  mapDatasets.value = transformToBySiteDataset(datasets)
  timeDatasets.value = datasets.map(({ color, detectionsByTimeHour, detectionsByTimeDay, detectionsByTimeMonth, detectionsByTimeDate }) => {
    const data: SpotlightDataByTime = {
      hourOfDay: detectionsByTimeHour,
      dayOfWeek: detectionsByTimeDay,
      monthOfYear: detectionsByTimeMonth,
      date: detectionsByTimeDate
    }
    const d: SpotlightTimeDataset = { color, data }
    return d
  })
  exportDatasets.value = datasets.map(({ detectionsByLocationSite, detectionsByTimeHour, detectionsByTimeMonthYear, detectionsByTimeYear }) => {
    return {
      sites: detectionsByLocationSite,
      hour: detectionsByTimeHour,
      month: detectionsByTimeMonthYear,
      year: detectionsByTimeYear
    }
  })

  loadingDatasets.value = false
}

const resetData = (): void => {
  predictedOccupancyMaps.value = []
  metrics.value = []
  mapDatasets.value = []
  timeDatasets.value = []
  exportDatasets.value = []
  speciesInformation.value = null
  speciesCalls.value = []
  speciesPhotos.value = []
  isLocationRedacted.value = false
}

const getSpeciesInformation = async (): Promise<void> => {
  if (store.selectedProject?.id === undefined) {
    return
  }

  loadingSpecies.value = true

  const savedSpecies = species.value

  if (!savedSpecies) {
    return
  }

  try {
    const data = await apiBioGetProjectSpeciesOne(apiClientBio, store.selectedProject.id, savedSpecies.taxonSpeciesSlug)

    // Only update if received data matches current filters
    if (species.value?.scientificName === savedSpecies.scientificName) {
      speciesInformation.value = data?.speciesInformation ?? null
      speciesCalls.value = data?.speciesCalls ?? []
      speciesPhotos.value = data?.speciesPhotos ?? []
      predictedOccupancyMaps.value = data?.predictedOccupancyMaps ?? []
    }
  } catch (e) {
    // TODO 167: Error handling
  }
  loadingSpecies.value = false
}

const exportDetectionsData = async (): Promise<void> => {
  const prefix = species.value ? `${DEFAULT_PREFIX}-${species.value?.taxonSpeciesSlug}` : DEFAULT_PREFIX
  await exportDetectionCSV(filters.value, exportDatasets.value, prefix)
}
</script>
