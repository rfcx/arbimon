import { Vue } from 'vue-class-component'

import { TaxonomyModels } from '@/models'
import { SpeciesService } from '@/services'

export default class ActivityPatterns extends Vue {
  species: TaxonomyModels.Species[] = []
  selectedSpecies: number | null = null

  get speciesId (): string | string[] | undefined {
    return this.$route.params.speciesId
  }

  async mounted (): Promise<void> {
    this.species = (await SpeciesService.getAllSpecies()).sort((a, b) => a.speciesName.localeCompare(b.speciesName))
    if (this.species.length > 0) {
      this.selectedSpecies = Number(this.speciesId ?? this.species[0].speciesId)
    }
  }
}
