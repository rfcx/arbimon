import { type AxiosInstance } from 'axios'
import { Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'
import { useRoute } from 'vue-router'

import { apiBioGetRichnessExport } from '@rfcx-bio/common/api-bio/richness/richness-export'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { apiClientKey, storeKey } from '@/globals'
import { downloadCsvReports } from '@/insights/species-richness/csv'
import { type ColoredFilter, filterToQuery } from '~/filters'
import { INFO_TOPICS } from '~/info/info-page'
import { type BiodiversityStore, useStore } from '~/store'

const DEFAULT_PREFIX = 'Species-Richness-Raw-Data'
const store = useStore()
const route = useRoute()

export default class SpeciesRichnessIntroduction extends Vue {
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore
  @Inject({ from: apiClientKey }) readonly apiClientBio!: AxiosInstance

  @Prop() filters!: ColoredFilter[]
  @Prop() hasData!: boolean

  loading = false

  get infoTopic (): string {
    return INFO_TOPICS.richness
  }

  get isProjectMember (): boolean {
    return store.userIsProjectMember
  }

  get isViewingAsGuest (): boolean {
    return route?.query !== undefined && route.query?.guest === '1'
  }

  get isProjectViewOnly (): boolean {
    return this.store.project?.entitlementState === 'inactive' || this.store.project?.viewOnlyEffective === true
  }

  get exportTitle (): string {
    if (this.isProjectViewOnly) return 'This project is view-only and cannot export source data.'
    if (!this.isProjectMember || this.isViewingAsGuest) return 'Only available to project members'
    if (!this.hasData) return 'No data selected'
    return ''
  }

  // TODO ??? - I think Vue 3 composition API would let us simply import the function (instead of proxying it)
  async exportCsvReports (): Promise<void> {
    const projectId = this.store.project?.id
    if (projectId === undefined || this.isProjectViewOnly) return

    this.loading = true
    const reports = (await Promise.all(
      this.filters.map(async filter => await apiBioGetRichnessExport(this.apiClientBio, projectId, filterToQuery(filter)).then(res => res?.richnessExport))
    )).filter(isDefined)
    await downloadCsvReports(this.filters, reports, DEFAULT_PREFIX, this.store.projectFilters?.taxonClasses ?? [])
    this.loading = false
  }
}
