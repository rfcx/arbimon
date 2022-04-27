<template>
  <!-- TODO: Extract banner states to banner component -->
  <!-- <div v-if="store.projectData.value.isLoading" />
  <div v-else>
    <draft-banner
      v-if="lastUpdatedAt"
      current-mode="Draft"
      :sync-updated="lastUpdatedAt"
      :project-slug="store.selectedProject?.slug"
    />
  </div> -->
  <page-title
    page-title="Species Spotlight"
    page-subtitle="An in-depth look at the detection and occupancy trends of a single species"
    :topic="infoTopic"
  >
    <export-button
      :disabled="!hasExportData"
      :title="hasExportData ? '' : 'No data selected'"
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
    :species-slug="$route.params.speciesSlug"
    @emit-selected-species-changed="onSelectedSpeciesChange"
  />
  <species-title
    v-if="speciesInformation"
    :species="speciesInformation"
  />
  <div class="grid grid-cols-5 gap-x-2rem">
    <div class="col-span-full sm:col-span-2">
      <species-images
        v-if="speciesPhotos.length > 0"
        :species-photos="speciesPhotos"
        class="my-4"
      />
      <spotlight-player
        v-if="speciesCalls"
        :species-calls="speciesCalls"
      />
      <species-background-information
        :species-information="speciesInformation"
      />
    </div>
    <div class="col-span-full sm:col-span-3">
      <activity-patterns-metrics
        :metrics="metrics"
        class="mt-6"
      />
      <location-redacted-banner
        v-if="isLocationRedacted"
        class="mt-5"
      />
      <activity-patterns-by-location
        v-else
        :datasets="mapDatasets"
        :species="species"
        class="mt-5"
      />
      <activity-patterns-predicted-occupancy
        :species-slug="$route.params.speciesSlug"
        :predicted-occupancy-maps="predictedOccupancyMaps"
        class="mt-5"
      />
      <activity-patterns-by-time
        dom-id="activity-by-time"
        :species="species"
        :datasets="timeDatasets"
        class="my-5"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { PredictedOccupancyMap } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { SpotlightExportData } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'
import { TaxonSpeciesCallLight, TaxonSpeciesPhotoLight } from '@rfcx-bio/common/dao/types'
import { SpeciesInProjectLight } from '@rfcx-bio/common/dao/types/species-in-project'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { exportDetectionCSV, transformToBySiteDataset, transformToMetricsDatasets } from '@/activity-patterns/functions'
import { Metrics } from '@/activity-patterns/types'
import { INFO_TOPICS } from '@/info/info-page'
import { ColoredFilter, ComparisonListComponent, filterToDataset } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'
import { ROUTE_NAMES } from '~/router'
import ActivityPatternsByLocation from './components/activity-patterns-by-location/activity-patterns-by-location.vue'
import { SpotlightTimeDataset } from './components/activity-patterns-by-time/activity-patterns-by-time'
import ActivityPatternsByTime from './components/activity-patterns-by-time/activity-patterns-by-time.vue'
import ActivityPatternsPredictedOccupancy from './components/activity-patterns-predicted-occupancy/activity-patterns-predicted-occupancy.vue'
import SpeciesBackgroundInformation from './components/species-background-information/species-background-information.vue'
import SpeciesImages from './components/species-images/species-images.vue'
import SpeciesSelector from './components/species-selector/species-selector.vue'
import SpeciesTitle from './components/species-title/species-title.vue'
import ActivityPatternsMetrics from './components/spotlight-metrics/spotlight-metrics.vue'
import SpotlightPlayer from './components/spotlight-player/spotlight-player.vue'
import { spotlightService } from './services'

const DEFAULT_PREFIX = 'Spotlight-Raw-Data'

// const store = useStore()
const router = useRouter()
const route = useRoute()

// Dataset definitions
const species = ref<SpeciesInProjectLight | null>(null)
const filters = ref<ColoredFilter[]>([])

// Data for children
const predictedOccupancyMaps = ref<PredictedOccupancyMap[]>([])
const metrics = ref<Metrics[]>([])
const mapDatasets = ref<MapDataSet[]>([])
const timeDatasets = ref<SpotlightTimeDataset[]>([])
const exportDatasets = ref<SpotlightExportData[]>([])
const speciesInformation = ref<SpeciesInProjectLight | null>(null)
const speciesCalls = ref<TaxonSpeciesCallLight[]>([])
const speciesPhotos = ref<TaxonSpeciesPhotoLight[]>([])
const isLocationRedacted = ref(false)

watch(() => route.params.projectSlug, (toProjectSlug, fromProjectSlug) => {
  if (toProjectSlug !== fromProjectSlug) {
    resetData()
  }
})

const hasExportData = computed(() => {
  return timeDatasets.value.length > 0
})

const infoTopic = computed(() => {
  return INFO_TOPICS.spotlight
})

// const lastUpdatedAt = computed(() => store.projectData.value.data?.updatedList[0]?.updatedAt ?? null)

const resetData = () => {
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

const onSelectedSpeciesChange = async (sp: SpeciesInProjectLight | undefined) => {
  const speciesSlug = sp?.taxonSpeciesSlug
  void router.replace({ name: ROUTE_NAMES.activityPatterns, params: { speciesSlug } })

  species.value = sp ?? null

  await Promise.all([
    onDatasetChange(),
    getSpeciesInformation()
  ])
}

const onFilterChange = async (fs: ColoredFilter[]) => {
  filters.value = fs
  await onDatasetChange()
}

const onDatasetChange = async () => {
  // TODO 117 - Only update the changed dataset
  const speciesId = species.value?.taxonSpeciesId ?? NaN
  if (!speciesId) return

  const datasets = (await Promise.all(
    filters.value.map(async (filter) => {
      const { color, startDate, endDate, sites, otherFilters } = filter
      const data = await spotlightService.getSpotlightDataset(filterToDataset(filter), speciesId)
      return data ? { ...data, startDate, endDate, color, sites: sites.flatMap(({ value }) => value), otherFilters } : data
    })
  )).filter(isDefined)

  isLocationRedacted.value = datasets[0]?.isLocationRedacted ?? true
  metrics.value = transformToMetricsDatasets(datasets)
  mapDatasets.value = transformToBySiteDataset(datasets)
  timeDatasets.value = datasets.map(({ color, detectionsByTimeHour, detectionsByTimeDay, detectionsByTimeMonth, detectionsByTimeDate }) => {
    const data = {
      hourOfDay: detectionsByTimeHour,
      dayOfWeek: detectionsByTimeDay,
      monthOfYear: detectionsByTimeMonth,
      dateSeries: detectionsByTimeDate
    }
    return { color, data }
  })
  exportDatasets.value = datasets
    .map(({ detectionsByLocationSite, detectionsByTimeHour, detectionsByTimeMonthYear, detectionsByTimeYear }) =>
      ({ sites: detectionsByLocationSite, hour: detectionsByTimeHour, month: detectionsByTimeMonthYear, year: detectionsByTimeYear }))
}

const getSpeciesInformation = async () => {
  const sp = species.value
  if (!sp) return

  try {
    const data = await spotlightService.getSpeciesOne(sp.taxonSpeciesSlug)

    // Only update if received data matches current filters
    if (species.value?.scientificName === sp.scientificName) {
      speciesInformation.value = data?.speciesInformation ?? null
      speciesCalls.value = data?.speciesCalls ?? []
      speciesPhotos.value = data?.speciesPhotos ?? []
      predictedOccupancyMaps.value = data?.predictedOccupancyMaps ?? []
    }
  } catch (e) {
    // TODO 167: Error handling
  }
}

const exportDetectionsData = async () => {
  const prefix = species.value ? `${DEFAULT_PREFIX}-${species.value?.taxonSpeciesSlug}` : DEFAULT_PREFIX
  await exportDetectionCSV(filters.value, exportDatasets.value, prefix)
}
</script>
