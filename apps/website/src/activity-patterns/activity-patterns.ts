import { Options, Vue } from 'vue-class-component'

import { PredictedOccupancyMap } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { ActivitySpotlightDataByExport, ActivitySpotlightDataBySite } from '@rfcx-bio/common/api-bio/spotlight/common'
import { Species, SpeciesCall, SpeciesLight } from '@rfcx-bio/common/domain'
import { EXTINCTION_RISK_PROTECTED_CODES } from '@rfcx-bio/common/iucn'
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
  exportDatasets: SpotlightExportData[] = []
  speciesInformation: Species | null = null

  get hasExportData (): boolean {
    return this.timeDatasets.length > 0
  }

  get speciesCall (): SpeciesCall | null {
    return this.speciesInformation?.speciesCall ?? null
  }

  get infoTopic (): string {
    return INFO_TOPICS.spotlight
  }

  get isLocationRedacted (): boolean {
    return this.speciesInformation ? EXTINCTION_RISK_PROTECTED_CODES.includes(this.speciesInformation.extinctionRisk) : false
  }

  async onSelectedSpeciesChange (species: SpeciesLight | undefined): Promise<void> {
    const speciesSlug = species?.speciesSlug
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
    const speciesId = this.species?.speciesId ?? NaN
    if (!speciesId) return

    const filters = this.filters

    const datasets = (await Promise.all(
      filters.map(async (filter) => {
        const { color, startDate, endDate, sites, otherFilters } = filter
        const data = await spotlightService.getSpotlightDataset(filterToDataset(filter), speciesId)
        return data ? { ...data, startDate, endDate, color, sites: sites.flatMap(({ value }) => value), otherFilters } : data
      })
    )).filter(isDefined)

    this.metrics = transformToMetricsDatasets(datasets)
    this.mapDatasets = transformToBySiteDataset(datasets)
    this.timeDatasets = datasets.map(({ color, activityByTime }) => ({ color, data: activityByTime }))
    this.exportDatasets = datasets.map(({ activityBySite, activityByExport }) => ({ sites: activityBySite, ...activityByExport }))
  }

  async getSpeciesInformation (): Promise<void> {
    const species = this.species
    if (!species) return

    try {
      const data = await spotlightService.getSpeciesOne(species.speciesSlug)

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
    const prefix = this.species ? `${DEFAULT_PREFIX}-${this.species?.speciesSlug}` : DEFAULT_PREFIX
    await exportDetectionCSV(this.filters, this.exportDatasets, prefix)
  }
}
