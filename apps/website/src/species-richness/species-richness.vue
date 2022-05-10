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
  <species-richness-introduction
    :filters="filters"
    :has-data="hasData"
  />
  <filter-list-component
    class="mt-5"
    :can-filter-by-taxon="true"
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
import { DetectionFilter, FilterListComponent } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'
import { useStore } from '~/store'
import { TimeBucket } from '~/time-buckets'
import SpeciesRichnessByClass from './components/species-richness-by-class/species-richness-by-class.vue'
import SpeciesRichnessByLocation from './components/species-richness-by-location/species-richness-by-location.vue'
import SpeciesRichnessByTime from './components/species-richness-by-time/species-richness-by-time.vue'
import SpeciesRichnessDetectedSpecies from './components/species-richness-detected-species/species-richness-detected-species.vue'
import { DetectedSpeciesItem } from './components/species-richness-detected-species/types'
import SpeciesRichnessIntroduction from './components/species-richness-introduction/species-richness-introduction.vue'
import { getTableData, transformToBarChartDataset, transformToBySiteDataset } from './functions'
import { richnessService } from './services'

const store = useStore()
const route = useRoute()
// const projectData = useProjectData()

// Dataset definitions
const filters = ref<DetectionFilter[]>([])

// Data for children
const colors = store.datasetColors
const speciesByClassDatasets = ref<GroupedBarChartItem[]>([])
const speciesByLocationDatasets = ref<MapDataSet[]>([])
const speciesByTimeDatasets = ref<Array<{data: Record<TimeBucket, Record<number, number>>}>>([])
const detectedSpecies = ref<DetectedSpeciesItem[]>([])

watch(() => route.params.projectSlug, async (toProjectSlug, fromProjectSlug) => {
  if (toProjectSlug !== fromProjectSlug) {
    await onDatasetChange()
  }
})

const hasData = computed(() => {
  return speciesByClassDatasets.value.length > 0
})

// const lastUpdatedAt = mapLoadable(projectData, (data): Date | null => data.updatedList[0]?.updatedAt ?? null)

const onFilterChange = async (fs: DetectionFilter[]) => {
  filters.value = fs
  await onDatasetChange()
}

const onDatasetChange = async () => {
  // TODO 117 - Only update the changed dataset
  const datasets = (await Promise.all(
    filters.value.map(async (filter) => {
      const { dateStartLocal, dateEndLocal, siteGroups, taxonClasses } = filter
      const data = await richnessService.getRichnessDataset(filter)
      if (!data) return undefined

      return { ...data, dateStartLocal, dateEndLocal, siteGroups, taxonClasses }
    })
  )).filter(isDefined)

  speciesByClassDatasets.value = transformToBarChartDataset(datasets)
  speciesByLocationDatasets.value = transformToBySiteDataset(datasets)
  speciesByTimeDatasets.value = datasets
    .map(({ richnessByTimeHourOfDay, richnessByTimeDayOfWeek, richnessByTimeMonthOfYear, richnessByTimeUnix }) => {
      const data = {
          hourOfDay: richnessByTimeHourOfDay,
          dayOfWeek: richnessByTimeDayOfWeek,
          monthOfYear: richnessByTimeMonthOfYear,
          dateSeries: richnessByTimeUnix
        }
      return { data }
    })
  detectedSpecies.value = getTableData(datasets)
}

</script>
