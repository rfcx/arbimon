import { Vue } from 'vue-class-component'
import { Emit, Prop, Watch } from 'vue-property-decorator'

import { Species } from '../../../_services/api'
import { getAllSpecies } from '../../../_services/api/species-service'

export default class SpeciesSelector extends Vue {
  @Prop() speciesSlug!: string
  @Emit() emitSelectedSpeciesChanged (species: Species): Species {
    return species
  }

  selectedSpeciesSlug = ''
  allSpecies: Species[] = []
  loadingSpecies = false
  currentSpeciesQuery = ''

  get selectedSpecies (): Species | undefined {
    if (!this.selectedSpeciesSlug) return undefined
    return this.allSpecies.find(s => s.speciesSlug === this.selectedSpeciesSlug)
  }

  get filteredSpecies (): Species[] {
    if (!this.currentSpeciesQuery) return this.allSpecies
    const query = this.currentSpeciesQuery.trim().toLowerCase()
    return this.allSpecies.filter(s => s.speciesName.toLowerCase().split(' ').some(w => w.startsWith(query)))
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

  async onType (query: string): Promise<void> {
    this.loadingSpecies = true
    // TODO: Call species API
    setTimeout(() => { this.loadingSpecies = false }, 1000)
  }

  onFilterType (query: string): void {
    this.currentSpeciesQuery = query
  }
}
