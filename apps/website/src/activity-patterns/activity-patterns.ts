import { Options, Vue } from 'vue-class-component'

import { Species, SpeciesCall } from '@rfcx-bio/common/api-bio/species/types'
import { ActivitySpotlightDataByExport, ActivitySpotlightDataBySite } from '@rfcx-bio/common/api-bio/spotlight/common'
import { SpeciesInProjectLight } from '@rfcx-bio/common/dao/types/species-in-project'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { exportDetectionCSV, transformToBySiteDataset, transformToMetricsDatasets } from '@/activity-patterns/functions'
import { Metrics, TimeDataset } from '@/activity-patterns/types'
import { INFO_TOPICS } from '@/info/info-page'
import { ColoredFilter, ComparisonListComponent, filterToDataset } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'
import { ROUTE_NAMES } from '~/router'
import ActivityPatternsByLocation from './components/activity-patterns-by-location/activity-patterns-by-location.vue'
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

export type SpotlightExportData = ActivitySpotlightDataByExport & { sites: ActivitySpotlightDataBySite }

@Options({
  components: {
    ActivityPatternsByLocation,
    ActivityPatternsByTime,
    ActivityPatternsMetrics,
    ActivityPatternsPredictedOccupancy,
    ComparisonListComponent,
    SpeciesBackgroundInformation,
    SpeciesImages,
    SpeciesTitle,
    SpeciesSelector,
    SpotlightPlayer
  }
})
export default class ActivityPatternsPage extends Vue {
  // Dataset definitions
  species: SpeciesInProjectLight | null = null
  filters: ColoredFilter[] = []

  // Data for children
  predictedOccupancyMaps: string[] = []
  metrics: Metrics[] = []
  mapDatasets: MapDataSet[] = []
  timeDatasets: TimeDataset[] = []
  exportDatasets: SpotlightExportData[] = []
  speciesInformation: Species | null = null
  isLocationRedacted = false

  get hasExportData (): boolean {
    return this.timeDatasets.length > 0
  }

  get speciesCalls (): SpeciesCall[] {
    return this.speciesInformation?.speciesCalls ?? []
  }

  get infoTopic (): string {
    return INFO_TOPICS.spotlight
  }

  async onSelectedSpeciesChange (species: SpeciesInProjectLight | undefined): Promise<void> {
    const speciesSlug = species?.taxonSpeciesSlug
    void this.$router.replace({ name: ROUTE_NAMES.activityPatterns, params: { speciesSlug } })

    this.species = species ?? null

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
    const speciesId = this.species?.taxonSpeciesId ?? NaN
    if (!speciesId) return

    const filters = this.filters

    const datasets = (await Promise.all(
      filters.map(async (filter) => {
        const { color, startDate, endDate, sites, otherFilters } = filter
        const data = await spotlightService.getSpotlightDataset(filterToDataset(filter), speciesId)
        return data ? { ...data, startDate, endDate, color, sites: sites.flatMap(({ value }) => value), otherFilters } : data
      })
    )).filter(isDefined)

    this.isLocationRedacted = datasets[0].isLocationRedacted
    this.metrics = transformToMetricsDatasets(datasets)
    this.mapDatasets = transformToBySiteDataset(datasets)
    this.timeDatasets = datasets.map(({ color, activityByTime }) => ({ color, data: activityByTime }))
    this.exportDatasets = datasets.map(({ activityBySite, activityByExport }) => ({ sites: activityBySite, ...activityByExport }))
  }

  async getSpeciesInformation (): Promise<void> {
    const species = this.species
    if (!species) return

    try {
      const data = await spotlightService.getSpeciesOne(species.taxonSpeciesSlug)

      // Only update if received data matches current filters
      if (this.species?.scientificName === species.scientificName) {
        this.predictedOccupancyMaps = data?.predictedOccupancyMaps ?? []
        this.speciesInformation = data?.speciesInformation ?? null
      }
    } catch (e) {
      // TODO 167: Error handling
    }
  }

  async exportDetectionsData (): Promise<void> {
    const prefix = this.species ? `${DEFAULT_PREFIX}-${this.species?.taxonSpeciesSlug}` : DEFAULT_PREFIX
    await exportDetectionCSV(this.filters, this.exportDatasets, prefix)
  }
}
