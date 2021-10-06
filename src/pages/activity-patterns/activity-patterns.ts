import { Vue } from 'vue-class-component'

import { TaxonomyModels } from '@/models'
import { MockupSpeciesService } from '@/services'

export default class ActivityPatterns extends Vue {
  species: TaxonomyModels.Species[] = []
  selectedSpecies: number | null = null

  async mounted (): Promise<void> {
    this.species = await this.getSpeciesname()
  }

  async getSpeciesname (): Promise<TaxonomyModels.Species[]> {
    const species = await MockupSpeciesService.getSpecies().sort((a, b) => a.speciesName.localeCompare(b.speciesName))
    this.selectedSpecies = species.length > 0 ? species[0].speciesId : null
    return species
  }
}
