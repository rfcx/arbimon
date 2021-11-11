import { Vue } from 'vue-class-component'
import { Emit, Prop, Watch } from 'vue-property-decorator'

import { Species } from '../../../_services/api'
import { getAllSpecies } from '../../../_services/api/species-service'

export default class SpeciesSelector extends Vue {
  @Prop() speciesSlug!: string
  @Emit() emitSelectedSpeciesChanged (species: Species): Species {
    return species
  }

  selectedSpeciesSlug: string = ''
  allSpecies: Species[] = []

  get selectedSpecies (): Species | undefined {
    if (!this.selectedSpeciesSlug) return undefined
    return this.allSpecies.find(s => s.speciesSlug === this.selectedSpeciesSlug)
  }

  override async created (): Promise<void> {
    this.selectedSpeciesSlug = this.speciesSlug
    this.allSpecies = (await getAllSpecies())
      .sort((a, b) => a.speciesName.localeCompare(b.speciesName))
  }

  @Watch('speciesSlug')
  onInitialSpeciesSlugChange (initialSpeciesSlug: string): void {
    if (this.speciesSlug && initialSpeciesSlug !== this.selectedSpeciesSlug) this.selectedSpeciesSlug = initialSpeciesSlug
  }

  @Watch('allSpecies')
  onAllSpeciesChange (allSpecies: Species[]): void {
    if (allSpecies.length > 0 && !this.selectedSpeciesSlug) this.selectedSpeciesSlug = allSpecies[0].speciesSlug
    if (this.selectedSpecies) this.emitSelectedSpeciesChanged(this.selectedSpecies)
  }

  @Watch('selectedSpeciesSlug')
  onSelectedSpeciesSlugChange (): void {
    if (this.selectedSpecies) this.emitSelectedSpeciesChanged(this.selectedSpecies)
  }
}
