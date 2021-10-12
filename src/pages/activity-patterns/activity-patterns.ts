import { Vue } from 'vue-class-component'
import { Watch } from 'vue-property-decorator'

import { TaxonomyModels } from '@/models'
import { ROUTES_NAME } from '@/router'
import { SpeciesService } from '@/services'

export default class ActivityPatterns extends Vue {
  species: TaxonomyModels.Species[] = []
  selectedSpeciesId: number | null = null

  async mounted (): Promise<void> {
    this.species = (await SpeciesService.getAllSpecies()).sort((a, b) => a.speciesName.localeCompare(b.speciesName))
    if (this.species.length > 0) {
      this.selectedSpeciesId = Number(this.$route.params.speciesId ?? this.species[0].speciesId)
    }
  }

  @Watch('selectedSpeciesId')
  onSelectedSpeciesIdChange (): void {
    void this.$router.push({
      name: ROUTES_NAME.activity_patterns,
      params: {
        speciesId: this.selectedSpeciesId
      }
    })
  }
}
