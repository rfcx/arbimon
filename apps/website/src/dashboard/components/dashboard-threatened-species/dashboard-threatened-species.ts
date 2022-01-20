import { groupBy } from 'lodash-es'
import { Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { ExtinctionRisk } from '@rfcx-bio/common/iucn'

import { RouteNames } from '~/router'
import { BiodiversityStore } from '~/store'

export interface ThreatenedSpeciesRow {
  speciesId: number
  scientificName: string
  commonName: string
  speciesSlug: string
  imageUrl: string
  extinctionRisk: ExtinctionRisk
}

export default class DashboardEndangeredSpecies extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Inject() readonly ROUTE_NAMES!: RouteNames
  @Prop() species!: ThreatenedSpeciesRow[]

  get hasData (): boolean {
    return this.species.length > 0
  }

  get speciesByRating (): Array<[string, ThreatenedSpeciesRow[]]> {
    return Object.entries(groupBy(this.species, row => row.extinctionRisk.label))
  }
}
