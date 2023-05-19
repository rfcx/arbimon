import { type AxiosInstance } from 'axios'
import { Vue } from 'vue-class-component'
import { Emit, Inject, Prop, Watch } from 'vue-property-decorator'
import { type RouteLocationNormalized } from 'vue-router'

import { apiBioGetProjectSpeciesAll } from '@rfcx-bio/common/api-bio/species/project-species-all'
import { type SpeciesInProjectTypes } from '@rfcx-bio/common/dao/types/species-in-project'

import { apiClientBioKey, routeNamesKey, storeKey } from '@/globals'
import { type RouteNames } from '~/router'
import { type BiodiversityStore } from '~/store'

export default class SpeciesSelector extends Vue {
  @Inject({ from: apiClientBioKey }) readonly apiClientBio!: AxiosInstance
  @Inject({ from: routeNamesKey }) readonly ROUTE_NAMES!: RouteNames
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore

  @Prop() speciesSlug!: string

  @Emit() emitSelectedSpeciesChanged (species: SpeciesInProjectTypes['light'] | undefined): SpeciesInProjectTypes['light'] | undefined {
    return species
  }

  selectedSpeciesSlug = ''
  allSpecies: Array<SpeciesInProjectTypes['light']> = []
  currentSpeciesQuery = ''

  get selectedSpecies (): SpeciesInProjectTypes['light'] | undefined {
    if (!this.selectedSpeciesSlug) return undefined
    return this.allSpecies.find(s => s.taxonSpeciesSlug === this.selectedSpeciesSlug)
  }

  get filteredSpecies (): Array<SpeciesInProjectTypes['light']> {
    if (!this.currentSpeciesQuery) return this.allSpecies
    const query = this.currentSpeciesQuery.trim().toLowerCase()

    return this.allSpecies
      .filter(s =>
        s.scientificName.toLowerCase().split(' ').some(w => w.startsWith(query)) ||
        (s.commonName?.toLowerCase().split(' ').some(w => w.startsWith(query)) ?? false)
      )
  }

  override async created (): Promise<void> {
    this.allSpecies = await this.getAllSpecies()
  }

  @Watch('$route')
  async onRouterChange (to: RouteLocationNormalized, from: RouteLocationNormalized): Promise<void> {
    if (to.params.projectSlug !== from.params.projectSlug) {
      this.selectedSpeciesSlug = ''
      this.allSpecies = await this.getAllSpecies()
      // reset not-exists species slug in the url.
      if (from.name === to.name && !this.allSpecies.length) {
        void this.$router.replace({ params: { speciesSlug: '' }, query: this.$route.query })
      }
    }
  }

  @Watch('speciesSlug')
  onInitialSpeciesSlugChange (initialSpeciesSlug: string): void {
    if (this.speciesSlug && initialSpeciesSlug !== this.selectedSpeciesSlug) this.selectedSpeciesSlug = initialSpeciesSlug
  }

  @Watch('allSpecies')
  onAllSpeciesChange (allSpecies: Array<SpeciesInProjectTypes['light']>): void {
    if (allSpecies.length > 0) {
      if (this.speciesSlug) {
        const matchedSlug = allSpecies.find(({ taxonSpeciesSlug }) => taxonSpeciesSlug === this.speciesSlug)
        this.selectedSpeciesSlug = matchedSlug ? this.speciesSlug : ''
        if (!matchedSlug) {
          // not-exists spesies; select a first species from the species list.
          this.selectedSpeciesSlug = allSpecies[0].taxonSpeciesSlug
        }
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

  async getAllSpecies (): Promise<Array<SpeciesInProjectTypes['light']>> {
    const projectId = this.store.selectedProject?.id
    if (projectId === undefined) return []

    return await apiBioGetProjectSpeciesAll(this.apiClientBio, projectId).then(res => res?.species) ?? []
  }
}
