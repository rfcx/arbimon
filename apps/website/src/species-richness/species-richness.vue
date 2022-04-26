<template>
  <!-- TODO: Extract banner states to banner component -->
  <div v-if="store.projectData.value.isLoading" />
  <div v-else>
    <draft-banner
      v-if="lastUpdatedAt"
      current-mode="Draft"
      :sync-updated="lastUpdatedAt"
      :project-slug="store.selectedProject?.slug"
    />
  </div>
  <species-richness-introduction
    :filters="filters"
    :has-data="hasData"
  />
  <comparison-list-component
    class="mt-5"
    @emit-select="onFilterChange"
  />
  <species-richness-by-class
    dom-id="species-by-class"
    :chart-data="speciesByClassDatasets"
    class="mt-5"
  />
  <species-richness-by-location
    :datasets="speciesByLocationDatasets"
    class="mt-5"
  />
  <species-richness-by-time
    dom-id="species-by-time"
    :datasets="speciesByTimeDatasets"
    class="mt-5"
  />
  <species-richness-detected-species
    :table-data="detectedSpecies"
    :colors="colors"
    class="mt-5"
  />
</template>
<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { isDefined } from '@rfcx-bio/utils/predicates'

import { GroupedBarChartItem } from '~/charts/horizontal-bar-chart'
import { ColoredFilter, ComparisonListComponent, filterToDataset } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'
import { useStore } from '~/store'
import { TimeBucket } from '~/time-buckets'
import SpeciesRichnessByClass from './components/species-richness-by-class/species-richness-by-class.vue'
import SpeciesRichnessByLocation from './components/species-richness-by-location/species-richness-by-location.vue'
import SpeciesRichnessByTime from './components/species-richness-by-time/species-richness-by-time.vue'
import SpeciesRichnessDetectedSpecies from './components/species-richness-detected-species/species-richness-detected-species.vue'
import { DetectedSpeciesItem } from './components/species-richness-detected-species/types'
import SpeciesRichnessIntroduction from './components/species-richness-introduction/species-richness-introduction.vue'
import { getBarChartDataset, getMapDataset, getTableData } from './functions'
import { richnessService } from './services'

const store = useStore()
const route = useRoute()

// Dataset definitions
const filters = ref<ColoredFilter[]>([])

// Data for children
const colors = store.datasetColors
const speciesByClassDatasets = ref<GroupedBarChartItem[]>([])
const speciesByLocationDatasets = ref<MapDataSet[]>([])
const speciesByTimeDatasets = ref<Array<{color: string, data: Record<TimeBucket, Record<number, number>>}>>([])
const detectedSpecies = ref<DetectedSpeciesItem[]>([])

watch(() => route.params.projectSlug, async (toProjectSlug, fromProjectSlug) => {
  if (toProjectSlug !== fromProjectSlug) {
    await onDatasetChange()
  }
})

const hasData = computed(() => {
  return speciesByClassDatasets.value.length > 0
})

const lastUpdatedAt = computed(() => store.projectData.value.data?.updatedList[0]?.updatedAt ?? null)

const onFilterChange = async (fs: ColoredFilter[]) => {
  filters.value = fs
  await onDatasetChange()
}

const onDatasetChange = async () => {
  // TODO 117 - Only update the changed dataset
  const datasets = await (await Promise.all(
    filters.value.map(async (filter) => {
      const { startDate, endDate, sites, color, otherFilters } = filter
      const f = filterToDataset(filter)
      const data = await richnessService.getRichnessDataset(f)
      return data ? { startDate, endDate, sites, color, otherFilters, data } : data
    })
  )).filter(isDefined)

  speciesByClassDatasets.value = getBarChartDataset(datasets)
  speciesByLocationDatasets.value = getMapDataset(datasets)
  speciesByTimeDatasets.value = datasets
    .map(({ color, data }) => {
      const { richnessByTimeHourOfDay, richnessByTimeDayOfWeek, richnessByTimeMonthOfYear, richnessByTimeUnix } = data
      return {
        color,
        data: {
          hourOfDay: richnessByTimeHourOfDay,
          dayOfWeek: richnessByTimeDayOfWeek,
          monthOfYear: richnessByTimeMonthOfYear,
          dateSeries: richnessByTimeUnix
        }
      }
    })
  detectedSpecies.value = getTableData(datasets)
}

</script>
