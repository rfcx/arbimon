import { Options, Vue } from 'vue-class-component'

import { PredictedOccupancyMap } from '@rfcx-bio/common/api-bio/species/project-species'
import { Species, SpeciesCall, SpeciesLight } from '@rfcx-bio/common/api-bio/species/species'

import { exportDetectionCSV, transformToBySiteDataset, transformToMetricsDatasets } from '@/activity-patterns/functions'
import { Metrics, TimeDataset } from '@/activity-patterns/types'
import { ActivityPatternsDataByExport, activityPatternsService } from '~/api/activity-patterns-service'
import { getPredictedOccupancyMaps } from '~/api/predicted-occupancy-service'
import { getSpecies } from '~/api/species-service'
import { ColoredFilter, ComparisonListComponent, filterToDataset } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'
import { ROUTE_NAMES } from '~/router'
import ActivityPatternsByLocation from './components/activity-patterns-by-location/activity-patterns-by-location.vue'
import ActivityPatternsByTime from './components/activity-patterns-by-time/activity-patterns-by-time.vue'
import ActivityPatternsPredictedOccupancy from './components/activity-patterns-predicted-occupancy/activity-patterns-predicted-occupancy.vue'
import SpeciesBackgroundInformation from './components/species-background-information/species-background-information.vue'
import SpeciesImages from './components/species-images/species-images.vue'
import SpeciesSelector from './components/species-selector/species-selector.vue'
import ActivityPatternsMetrics from './components/spotlight-metrics/spotlight-metrics.vue'
import SpotlightPlayer from './components/spotlight-player/spotlight-player.vue'

const DEFAULT_PREFIX = 'Spotlight-Raw-Data'

@Options({
  components: {
    ActivityPatternsByLocation,
    ActivityPatternsByTime,
    ActivityPatternsMetrics,
    ActivityPatternsPredictedOccupancy,
    ComparisonListComponent,
    SpeciesBackgroundInformation,
    SpeciesImages,
    SpeciesSelector,
    SpotlightPlayer
  }
})
export default class ActivityPatternsPage extends Vue {
  // Dataset definitions
  species: SpeciesLight | null = null
  filters: ColoredFilter[] = []

  // Data for children
  predictedOccupancyMaps: PredictedOccupancyMap[] = []
  metrics: Metrics[] = []
  mapDatasets: MapDataSet[] = []
  timeDatasets: TimeDataset[] = []
  exportDatasets: ActivityPatternsDataByExport[] = []
  speciesInformation: Species | null = null

  get hasExportData (): boolean {
    return this.timeDatasets.length > 0
  }

  get speciesCall (): SpeciesCall | null {
    return this.speciesInformation?.speciesCall ?? null
  }

  async onSelectedSpeciesChange (species: SpeciesLight | undefined): Promise<void> {
    const speciesSlug = species?.speciesSlug
    void this.$router.replace({ name: ROUTE_NAMES.activityPatterns, params: { speciesSlug } })

    this.species = species ?? null
    this.predictedOccupancyMaps = await getPredictedOccupancyMaps(species?.speciesSlug ?? '')
    await Promise.all([
      this.onDatasetChange(),
      this.getSpeciesInformation()
    ])
  }

  async onFilterChange (filters: ColoredFilter[]): Promise<void> {
    this.filters = filters
    await this.onDatasetChange()
  }

  async onDatasetChange (): Promise<void> {
    // TODO 117 - Only update the changed dataset
    const speciesId = this.species?.speciesId ?? NaN
    if (!speciesId) return

    const filters = this.filters
    const datasets = await Promise.all(
      // TODO ??: Clean the dataset date type between `DatasetDefinition`, `MapDataSet`, and `ColoredFilter`
      filters.map(async (filter) => {
        const { color, startDate, endDate } = filter
        const data = await activityPatternsService.getActivityPatternsData(filterToDataset(filter), speciesId)
        return { ...data, startDate, endDate, color }
      })
    )

    this.metrics = transformToMetricsDatasets(datasets)
    this.mapDatasets = transformToBySiteDataset(datasets)
    this.timeDatasets = datasets.map(({ color, activityByTime }) => ({ color, data: activityByTime }))
    this.exportDatasets = datasets.map(({ activityByExport }) => activityByExport)
  }

  async getSpeciesInformation (): Promise<void> {
    const scientificName = this.species?.scientificName
    if (!scientificName) return
    try {
      const speciesInformation = await getSpecies(scientificName)
      if (this.species?.scientificName === scientificName) {
        this.speciesInformation = speciesInformation ?? null
      }
    } catch (e) {
      // TODO 167: Error handling
    }
  }

  async exportDetectionsData (): Promise<void> {
    const prefix = this.species ? `${DEFAULT_PREFIX}-${this.species?.speciesSlug}` : DEFAULT_PREFIX
    await exportDetectionCSV(this.filters, this.exportDatasets, prefix)
  }
}
