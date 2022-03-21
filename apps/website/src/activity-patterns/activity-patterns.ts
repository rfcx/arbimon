import { Options, Vue } from 'vue-class-component'
import { Inject, Watch } from 'vue-property-decorator'
import { RouteLocationNormalized } from 'vue-router'

import { PredictedOccupancyMap } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { SpotlightExportData } from '@rfcx-bio/common/api-bio/spotlight/common'
import { TaxonSpeciesCallLight, TaxonSpeciesPhotoLight } from '@rfcx-bio/common/dao/types'
import { SpeciesInProjectLight } from '@rfcx-bio/common/dao/types/species-in-project'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { exportDetectionCSV, transformToBySiteDataset, transformToMetricsDatasets } from '@/activity-patterns/functions'
import { Metrics } from '@/activity-patterns/types'
import { INFO_TOPICS } from '@/info/info-page'
import { ColoredFilter, ComparisonListComponent, filterToDataset } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'
import { ROUTE_NAMES } from '~/router'
import { BiodiversityStore } from '~/store'
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
  @Inject() readonly store!: BiodiversityStore
  // Dataset definitions
  species: SpeciesInProjectLight | null = null
  filters: ColoredFilter[] = []

  // Data for children
  predictedOccupancyMaps: PredictedOccupancyMap[] = []
  metrics: Metrics[] = []
  mapDatasets: MapDataSet[] = []
  timeDatasets: SpotlightTimeDataset[] = []
  exportDatasets: SpotlightExportData[] = []
  speciesInformation: SpeciesInProjectLight | null = null
  speciesCalls: TaxonSpeciesCallLight[] = []
  speciesPhotos: TaxonSpeciesPhotoLight[] = []
  isLocationRedacted = false

  get hasExportData (): boolean {
    return this.timeDatasets.length > 0
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

    this.isLocationRedacted = datasets[0]?.isLocationRedacted ?? true
    this.metrics = transformToMetricsDatasets(datasets)
    this.mapDatasets = transformToBySiteDataset(datasets)
    this.timeDatasets = datasets.map(({ color, detectionsByTimeHour, detectionsByTimeDay, detectionsByTimeMonth, detectionsByTimeDate }) => {
      const data = {
        hourOfDay: detectionsByTimeHour,
        dayOfWeek: detectionsByTimeDay,
        monthOfYear: detectionsByTimeMonth,
        dateSeries: detectionsByTimeDate
      }
      return { color, data }
    })
    this.exportDatasets = datasets
      .map(({ detectionsByLocationSite, detectionsByTimeHour, detectionsByTimeMonthYear, detectionsByTimeYear }) =>
        ({ sites: detectionsByLocationSite, hour: detectionsByTimeHour, month: detectionsByTimeMonthYear, year: detectionsByTimeYear }))
  }

  @Watch('$route')
  async onRouterChange (to: RouteLocationNormalized, from: RouteLocationNormalized): Promise<void> {
    if (to.params.projectSlug !== from.params.projectSlug) {
      this.resetData()
    }
  }

  resetData (): void {
    this.predictedOccupancyMaps = []
    this.metrics = []
    this.mapDatasets = []
    this.timeDatasets = []
    this.exportDatasets = []
    this.speciesInformation = null
    this.speciesCalls = []
    this.speciesPhotos = []
    this.isLocationRedacted = false
  }

  async getSpeciesInformation (): Promise<void> {
    const species = this.species
    if (!species) return

    try {
      const data = await spotlightService.getSpeciesOne(species.taxonSpeciesSlug)

      // Only update if received data matches current filters
      if (this.species?.scientificName === species.scientificName) {
        this.speciesInformation = data?.speciesInformation ?? null
        this.speciesCalls = data?.speciesCalls ?? []
        this.speciesPhotos = data?.speciesPhotos ?? []
        this.predictedOccupancyMaps = data?.predictedOccupancyMaps ?? []
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
