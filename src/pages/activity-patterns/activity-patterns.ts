import { Vue } from 'vue-class-component'

import { MockupSpeciesService } from '@/services'

export default class ActivityPatterns extends Vue {
  species: string[] = []
  selectedSpecies = ''

  async mounted (): Promise<void> {
    this.species = await this.getSpeciesname()
  }

  async getSpeciesname (): Promise<string[]> {
    const species = await MockupSpeciesService.getSpecies().sort((a, b) => a.localeCompare(b))
    this.selectedSpecies = species.length > 0 ? species[0] : ''
    return species
  }
}
