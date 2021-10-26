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
  metricsDataset: Metrics[] = []

  get species (): Species | undefined {
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
  }

  @Watch('species')
  onSpeciesChange (species: Species[]): void {
    if (species.length > 0 && !this.selectedSpeciesSlug) {
      this.selectedSpeciesSlug = species[0].speciesSlug
    }
  }

  @Watch('selectedSpeciesSlug')
  onSelectedSpeciesSlugChange (speciesSlug: number): void {
    void this.$router.replace({ name: ROUTE_NAMES.activity_patterns, params: { speciesSlug } })
  }

  async onFilterChange (filters: ColoredFilter[]): Promise<void> {
    if (!this.species) return

    const datasets = await Promise.all(
      filters.map(async (filter) => {
        const data = await getActivityPatternsData(filterToDataset(filter), this.species.speciesId)
        return { ...filter, data }
      })
    )

    this.filters = filters
    this.metricsDataset = transformToMetricsDatasets(datasets)
  }
}
