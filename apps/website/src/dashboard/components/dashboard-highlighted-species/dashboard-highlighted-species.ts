import { Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { ExtinctionRisk } from '@rfcx-bio/common/iucn'

import { RouteNames } from '~/router'
import { BiodiversityStore } from '~/store'

export interface HighlightedSpeciesRow {
  slug: string
  taxonSlug: string
  scientificName: string
  commonName?: string
  photoUrl: string
  extinctionRisk: ExtinctionRisk
}

export default class DashboardHighlightedSpecies extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Inject() readonly ROUTE_NAMES!: RouteNames
  @Prop() species!: HighlightedSpeciesRow[]

  get hasData (): boolean {
    return this.species.length > 0
  }
}
