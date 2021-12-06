import { Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { ExtinctionRisk } from '@rfcx-bio/common/iucn'

import { RouteNames } from '~/router'
import { BiodiversityStore } from '~/store'

export interface EndangeredSpeciesRow {
  speciesId: number
  speciesName: string
  speciesSlug: string
  imageUrl: string
  extinctionRisk: ExtinctionRisk
}

export default class DashboardEndangeredSpecies extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Inject() readonly ROUTE_NAMES!: RouteNames
  @Prop() species!: EndangeredSpeciesRow[]

  get hasData (): boolean {
    return this.species.length > 0
  }
}
