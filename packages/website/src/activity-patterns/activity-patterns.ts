import { Options, Vue } from 'vue-class-component'

import { transformToBySiteDataset, transformToMetricsDatasets } from '@/activity-patterns/functions'
import { Metrics } from '@/activity-patterns/types'
import { Species } from '~/api'
import { activityPatternsService } from '~/api/activity-patterns-service'
import { ColoredFilter } from '~/dataset-filters'
import { ComparisonListComponent } from '~/dataset-filters/comparison-list'
import { filterToDataset } from '~/dataset-filters/functions'
import { ROUTE_NAMES } from '~/router'
import ActivityPatternsByLocation from './components/activity-patterns-by-location/activity-patterns-by-location.vue'
import ActivityPatternsMetrics from './components/metrics/metrics.vue'
import SpeciesBackgroundInformation from './components/species-background-information/species-background-information.vue'
import SpeciesSelector from './components/species-selector/species-selector.vue'

@Options({
  components: {
    ActivityPatternsByLocation,
    ActivityPatternsMetrics,
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
  metrics: Metrics[] = []
  mapDatasets: unknown = []

  async onSelectedSpeciesChange (species: Species | undefined): Promise<void> {
    const speciesSlug = species?.speciesSlug
    void this.$router.replace({ name: ROUTE_NAMES.activity_patterns, params: { speciesSlug } })

    this.species = species ?? null
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
      filters.map(async (filter) => {
        const { color } = filter
        const data = await activityPatternsService.getActivityPatternsData(filterToDataset(filter), speciesId)
        return { ...data, color }
      })
    )

    this.metrics = transformToMetricsDatasets(datasets)
    this.mapDatasets = transformToBySiteDataset(datasets)
  }
}
