import { Vue } from 'vue-class-component'
import { Watch } from 'vue-property-decorator'

import { TaxonomyModels } from '@/models'
import { ROUTES_NAME } from '@/router'
import { SpeciesService } from '@/services'

export default class ActivityPatternsPage extends Vue {
  species: TaxonomyModels.Species[] = []
  selectedSpeciesSlug = ''

  async mounted (): Promise<void> {
    this.species = (await SpeciesService.getAllSpecies())
      .sort((a, b) => a.speciesName.localeCompare(b.speciesName))
  }

  @Watch('species')
  onSpeciesChange (species: TaxonomyModels.Species[]): void {
    if (species.length > 0 && !this.selectedSpeciesSlug) {
      void this.$router.replace({ name: ROUTES_NAME.activity_patterns, params: { speciesSlug: species[0].speciesSlug } })
    }
  }

  @Watch('selectedSpeciesSlug')
  onSelectedSpeciesSlugChange (speciesSlug: number): void {
    void this.$router.push({ name: ROUTES_NAME.activity_patterns, params: { speciesSlug } })
  }

  @Watch('$route.params')
  onRouteParamsChange (): void {
    this.selectedSpeciesSlug = this.$route.params.speciesSlug as string
  }
}
