import { Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { SpeciesByExportReportRow } from '@rfcx-bio/common/api-bio/richness/common'

import { INFO_TOPICS } from '@/info/info-page'
import { downloadCsvReports } from '@/species-richness/csv'
import { ColoredFilter } from '~/filters'
import { BiodiversityStore } from '~/store'

const DEFAULT_PREFIX = 'Species-Richness-Raw-Data'

export default class SpeciesRichnessIntroduction extends Vue {
  @Inject() store!: BiodiversityStore
  @Prop() speciesByExports!: SpeciesByExportReportRow[][]
  @Prop() filters!: ColoredFilter[]
  @Prop() haveData!: boolean

  loading = false

  get infoTopic (): string {
    return INFO_TOPICS.richness
  }

  // TODO ??? - I think Vue 3 composition API would let us simply import the function (instead of proxying it)
  async exportCsvReports (): Promise<void> {
    this.loading = true
    await downloadCsvReports(this.filters, this.speciesByExports, DEFAULT_PREFIX, this.store.projectFilters?.taxonClasses ?? [])
    this.loading = false
  }
}
