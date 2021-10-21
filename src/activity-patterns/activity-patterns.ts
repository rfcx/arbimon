import { Options, Vue } from 'vue-class-component'
import { Watch } from 'vue-property-decorator'

import { Species } from '~/api'
import { getAllSpecies } from '~/api/species-service'
import { ColoredFilter } from '~/dataset-filters'
import { ComparisonListComponent } from '~/dataset-filters/comparison-list'
import { ROUTE_NAMES } from '~/router'
import ActivityPatternsMetrics from './components/metrics/metrics.vue'

@Options({
  components: {
    ComparisonListComponent,
    ActivityPatternsMetrics
  }
})
export default class ActivityPatternsPage extends Vue {
  species: Species[] = []
  selectedSpeciesSlug = ''
  filters: ColoredFilter[] = []

  async created (): Promise<void> {
    this.selectedSpeciesSlug = this.$route.params.speciesSlug as string
    this.species = (await getAllSpecies())
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
    this.filters = filters
  }
}
