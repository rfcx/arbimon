import { Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { routeNamesKey, storeKey } from '@/globals'
import { type RiskRatingUi } from '~/risk-ratings'
import { type RouteNames } from '~/router'
import { type BiodiversityStore } from '~/store'

export interface HighlightedSpeciesRow {
  slug: string
  taxonSlug: string
  scientificName: string
  commonName?: string
  photoUrl: string
  riskRating: RiskRatingUi
}

export default class DashboardHighlightedSpecies extends Vue {
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore
  @Inject({ from: routeNamesKey }) readonly ROUTE_NAMES!: RouteNames

  @Prop() species!: HighlightedSpeciesRow[]
}
