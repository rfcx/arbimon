import { Vue } from 'vue-class-component'
import { Emit, Inject, Prop, Watch } from 'vue-property-decorator'
import { RouteLocationNormalized } from 'vue-router'

import { SpeciesInProjectLight } from '@rfcx-bio/common/dao/types/species-in-project'

import { RouteNames } from '~/router'
import { spotlightService } from '../../services'

export default class SpeciesSelector extends Vue {
  @Inject() readonly ROUTE_NAMES!: RouteNames
  @Prop() speciesSlug!: string
  @Emit() emitSelectedSpeciesChanged (species: SpeciesInProjectLight | undefined): SpeciesInProjectLight | undefined {
    return species
  }

  selectedSpeciesSlug = ''
  allSpecies: SpeciesInProjectLight[] = []
  currentSpeciesQuery = ''

  get selectedSpecies (): SpeciesInProjectLight | undefined {
    if (!this.selectedSpeciesSlug) return undefined
    return this.allSpecies.find(s => s.taxonSpeciesSlug === this.selectedSpeciesSlug)
  }

  get filteredSpecies (): SpeciesInProjectLight[] {
    if (!this.currentSpeciesQuery) return this.allSpecies
    const query = this.currentSpeciesQuery.trim().toLowerCase()
    return this.allSpecies.filter(s => s.scientificName.toLowerCase().split(' ').some(w => w.startsWith(query)) || s.commonName.toLowerCase().split(' ').some(w => w.startsWith(query)))
  }

  override async created (): Promise<void> {
    this.allSpecies = await this.getAllSpecies()
  }

  @Watch('$route')
  async onRouterChange (to: RouteLocationNormalized, from: RouteLocationNormalized): Promise<void> {
    if (to.params.projectSlug !== from.params.projectSlug) {
      this.selectedSpeciesSlug = ''
      this.allSpecies = await this.getAllSpecies()
    }
  }

  @Watch('speciesSlug')
  onInitialSpeciesSlugChange (initialSpeciesSlug: string): void {
    if (this.speciesSlug && initialSpeciesSlug !== this.selectedSpeciesSlug) this.selectedSpeciesSlug = initialSpeciesSlug
  }

  @Watch('allSpecies')
  onAllSpeciesChange (allSpecies: SpeciesInProjectLight[]): void {
    if (allSpecies.length > 0) {
      if (this.speciesSlug) {
        const matchedSlug = allSpecies.find(({ taxonSpeciesSlug }) => taxonSpeciesSlug === this.speciesSlug)
        this.selectedSpeciesSlug = matchedSlug ? this.speciesSlug : ''
      } else {
        this.selectedSpeciesSlug = allSpecies[0].taxonSpeciesSlug
      }
    }
    if (this.selectedSpecies) this.emitSelectedSpeciesChanged(this.selectedSpecies)
  }

  @Watch('selectedSpeciesSlug')
  onSelectedSpeciesSlugChange (): void {
    if (this.selectedSpecies) this.emitSelectedSpeciesChanged(this.selectedSpecies)
  }

  onFilterType (query: string): void {
    this.currentSpeciesQuery = query
  }

  onResetQuery (): void {
    this.onFilterType('')
  }

  async getAllSpecies (): Promise<SpeciesInProjectLight[]> {
    return await spotlightService.getSpeciesAll() ?? []
  }
}
