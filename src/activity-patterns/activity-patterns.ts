import { Options, Vue } from 'vue-class-component'
import { Watch } from 'vue-property-decorator'

import { ColoredFilter } from '@/_components/datasets'
import { ComparisonListComponent } from '@/_components/datasets/comparison-list'
import { Species } from '@/_services/api'
import { getAllSpecies } from '@/_services/api/species-service'
import { ROUTE_NAMES } from '@/_services/router'

@Options({
  components: {
    ComparisonListComponent
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
