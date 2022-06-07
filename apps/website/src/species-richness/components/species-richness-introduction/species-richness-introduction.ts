import { AxiosInstance } from 'axios'
import { Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { apiBioGetRichnessExport } from '@rfcx-bio/common/api-bio/richness/richness-export'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { apiClientBioKey, storeKey } from '@/globals'
import { INFO_TOPICS } from '@/info/info-page'
import { downloadCsvReports } from '@/species-richness/csv'
import { ColoredFilter, filterToQuery } from '~/filters'
import { BiodiversityStore } from '~/store'

const DEFAULT_PREFIX = 'Species-Richness-Raw-Data'

export default class SpeciesRichnessIntroduction extends Vue {
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore
  @Inject({ from: apiClientBioKey }) readonly apiClientBio!: AxiosInstance

  @Prop() filters!: ColoredFilter[]
  @Prop() haveData!: boolean

  loading = false

  get infoTopic (): string {
    return INFO_TOPICS.richness
  }

  // TODO ??? - I think Vue 3 composition API would let us simply import the function (instead of proxying it)
  async exportCsvReports (): Promise<void> {
    const projectId = this.store.selectedProject?.id
    if (projectId === undefined) return

    this.loading = true
    const reports = (await Promise.all(
      this.filters.map(async filter => await apiBioGetRichnessExport(this.apiClientBio, projectId, filterToQuery(filter)).then(res => res?.richnessExport))
    )).filter(isDefined)
    await downloadCsvReports(this.filters, reports, DEFAULT_PREFIX, this.store.projectFilters?.taxonClasses ?? [])
    this.loading = false
  }
}
