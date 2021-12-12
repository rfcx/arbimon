import { Vue } from 'vue-class-component'
import { Emit, Prop, Watch } from 'vue-property-decorator'

import { SpeciesLight } from '@rfcx-bio/common/api-bio-types/species'

import { getAllSpecies } from '~/api/species-service'

export default class SpeciesSelector extends Vue {
  @Prop() speciesSlug!: string
  @Emit() emitSelectedSpeciesChanged (species: SpeciesLight): SpeciesLight {
    return species
  }

  selectedSpeciesSlug = ''
  allSpecies: SpeciesLight[] = []
  loadingSpecies = false
  currentSpeciesQuery = ''

  get selectedSpecies (): SpeciesLight | undefined {
    if (!this.selectedSpeciesSlug) return undefined
    return this.allSpecies.find(s => s.speciesSlug === this.selectedSpeciesSlug)
  }

  get filteredSpecies (): SpeciesLight[] {
    if (!this.currentSpeciesQuery) return this.allSpecies
    const query = this.currentSpeciesQuery.trim().toLowerCase()
    return this.allSpecies.filter(s => s.scientificName.toLowerCase().split(' ').some(w => w.startsWith(query)))
  }

  override async created (): Promise<void> {
    this.selectedSpeciesSlug = this.speciesSlug
    this.allSpecies = (await getAllSpecies())
      .sort((a, b) => a.scientificName.localeCompare(b.scientificName))
  }

  @Watch('speciesSlug')
  onInitialSpeciesSlugChange (initialSpeciesSlug: string): void {
    if (this.speciesSlug && initialSpeciesSlug !== this.selectedSpeciesSlug) this.selectedSpeciesSlug = initialSpeciesSlug
  }

  @Watch('allSpecies')
  onAllSpeciesChange (allSpecies: SpeciesLight[]): void {
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
