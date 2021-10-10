import { Vue } from 'vue-class-component'

import { TaxonomyModels } from '@/models'
import { SpeciesService } from '@/services'

export default class ActivityPatterns extends Vue {
  species: TaxonomyModels.Species[] = []
  selectedSpecies: number | null = null

  async mounted (): Promise<void> {
    this.species = (await SpeciesService.getAllSpecies()).sort((a, b) => a.speciesName.localeCompare(b.speciesName))
    if (this.species.length > 0) {
      this.selectedSpecies = this.species[0].speciesId
    }
  }
}
