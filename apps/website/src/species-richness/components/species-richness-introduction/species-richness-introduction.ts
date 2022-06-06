import { AxiosInstance } from 'axios'
import { Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { isDefined } from '@rfcx-bio/utils/predicates'

import { INFO_TOPICS } from '@/info/info-page'
import { downloadCsvReports } from '@/species-richness/csv'
import { getRichnessExport } from '@/species-richness/services'
import { ColoredFilter, filterToDataset } from '~/filters'
import { BiodiversityStore } from '~/store'

const DEFAULT_PREFIX = 'Species-Richness-Raw-Data'

export default class SpeciesRichnessIntroduction extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Inject() readonly apiClientBio!: AxiosInstance

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
      this.filters.map(async filter => await getRichnessExport(this.apiClientBio, projectId, filterToDataset(filter)))
    )).filter(isDefined)
    await downloadCsvReports(this.filters, reports, DEFAULT_PREFIX, this.store.projectFilters?.taxonClasses ?? [])
    this.loading = false
  }
}
