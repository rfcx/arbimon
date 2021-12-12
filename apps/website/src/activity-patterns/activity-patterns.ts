import { Options, Vue } from 'vue-class-component'

import { PredictedOccupancyMap } from '@rfcx-bio/common/api-bio-types/project-species'

import { transformToBySiteDataset, transformToMetricsDatasets } from '@/activity-patterns/functions'
import { Metrics, TimeDataset } from '@/activity-patterns/types'
import { Species } from '~/api'
import { activityPatternsService } from '~/api/activity-patterns-service'
import { getPredictedOccupancyMaps } from '~/api/predicted-occupancy-service'
import { ColoredFilter, ComparisonListComponent, filterToDataset } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'
import { ROUTE_NAMES } from '~/router'
import ActivityPatternsByLocation from './components/activity-patterns-by-location/activity-patterns-by-location.vue'
import ActivityPatternsByTime from './components/activity-patterns-by-time/activity-patterns-by-time.vue'
import ActivityPatternsPredictedOccupancy from './components/activity-patterns-predicted-occupancy/activity-patterns-predicted-occupancy.vue'
import ActivityPatternsMetrics from './components/metrics/metrics.vue'
import SpeciesBackgroundInformation from './components/species-background-information/species-background-information.vue'
import SpeciesSelector from './components/species-selector/species-selector.vue'

@Options({
  components: {
    ActivityPatternsByLocation,
    ActivityPatternsByTime,
    ActivityPatternsMetrics,
    ActivityPatternsPredictedOccupancy,
    ComparisonListComponent,
    SpeciesBackgroundInformation,
    SpeciesSelector
  }
})
export default class ActivityPatternsPage extends Vue {
  // Dataset definitions
  species: Species | null = null
  filters: ColoredFilter[] = []

  // Data for children
  predictedOccupancyMaps: PredictedOccupancyMap[] = []
  metrics: Metrics[] = []
  mapDatasets: MapDataSet[] = []
  timeDatasets: TimeDataset[] = []

  async onSelectedSpeciesChange (species: Species | undefined): Promise<void> {
    const speciesSlug = species?.speciesSlug
    void this.$router.replace({ name: ROUTE_NAMES.activityPatterns, params: { speciesSlug } })

    this.species = species ?? null
    this.predictedOccupancyMaps = await getPredictedOccupancyMaps(species?.speciesSlug ?? '')
    await this.onDatasetChange()
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
  }
}
