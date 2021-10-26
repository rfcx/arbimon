import { Options, Vue } from 'vue-class-component'
import { Watch } from 'vue-property-decorator'

import { transformToMetricsDatasets } from '@/activity-patterns/functions'
import { Metrics } from '@/activity-patterns/types'
import { Species } from '~/api'
import { getActivityPatternsData } from '~/api/activity-patterns-service/activity-patterns-service-mock'
import { getAllSpecies } from '~/api/species-service'
import { ColoredFilter } from '~/dataset-filters'
import { ComparisonListComponent } from '~/dataset-filters/comparison-list'
import { filterToDataset } from '~/dataset-filters/functions'
import { ROUTE_NAMES } from '~/router'
import ActivityPatternsMetrics from './components/metrics/metrics.vue'
import SpeciesBackgroundInformation from './components/species-background-information/species-background-information.vue'

@Options({
  components: {
    ComparisonListComponent,
    ActivityPatternsMetrics,
    SpeciesBackgroundInformation
  }
})
export default class ActivityPatternsPage extends Vue {
  allSpecies: Species[] = []
  selectedSpeciesSlug = ''
  filters: ColoredFilter[] = []
  metrics: Metrics[] = []

  get selectedSpecies (): Species | undefined {
    return this.allSpecies.find(s => s.speciesSlug === this.selectedSpeciesSlug)
  }

  // TODO 156: Get species name from species object (not slug)
  get selectedSpeciesName (): string {
    return this.selectedSpeciesSlug.replaceAll('-', ' ')
  }

  async created (): Promise<void> {
    this.selectedSpeciesSlug = this.$route.params.speciesSlug as string
    this.allSpecies = (await getAllSpecies())
      .sort((a, b) => a.speciesName.localeCompare(b.speciesName))
    await this.onDatasetChange()
  }

  @Watch('selectedSpecies', { deep: true })
  async onSpeciesChange (species: Species[]): Promise<void> {
    if (species.length > 0 && !this.selectedSpeciesSlug) {
      this.selectedSpeciesSlug = species[0].speciesSlug
    }
    await this.onDatasetChange()
  }

  @Watch('selectedSpeciesSlug')
  onSelectedSpeciesSlugChange (speciesSlug: number): void {
    void this.$router.replace({ name: ROUTE_NAMES.activity_patterns, params: { speciesSlug } })
  }

  async onFilterChange (filters: ColoredFilter[]): Promise<void> {
    this.filters = filters
    await this.onDatasetChange()
  }

  async onDatasetChange (): Promise<void> {
    const speciesId = this.selectedSpecies?.speciesId ?? NaN
    if (!this.selectedSpecies) return

    const filters = this.filters
    const datasets = await Promise.all(
      filters.map(async (filter) => {
        const data = await getActivityPatternsData(filterToDataset(filter), speciesId)
        return { ...filter, data }
      })
    )

    this.metrics = transformToMetricsDatasets(datasets)
  }
}
