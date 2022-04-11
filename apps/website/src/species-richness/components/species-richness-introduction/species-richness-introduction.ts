import { Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { isDefined } from '@rfcx-bio/utils/predicates'

import { INFO_TOPICS } from '@/info/info-page'
import { downloadCsvReports } from '@/species-richness/csv'
import { richnessService } from '@/species-richness/services'
import { ColoredFilter, filterToDataset } from '~/filters'
import { BiodiversityStore } from '~/store'

const DEFAULT_PREFIX = 'Species-Richness-Raw-Data'

export default class SpeciesRichnessIntroduction extends Vue {
  @Inject() store!: BiodiversityStore
  @Prop() filters!: ColoredFilter[]
  @Prop() haveData!: boolean

  loading = false

  get infoTopic (): string {
    return INFO_TOPICS.richness
  }

  // TODO ??? - I think Vue 3 composition API would let us simply import the function (instead of proxying it)
  async exportCsvReports (): Promise<void> {
    this.loading = true
    const reports = await (await Promise.all(
      this.filters.map(async (filter) => {
        return await richnessService.getRichnessExport(filterToDataset(filter))
      })
    )).filter(isDefined)
    await downloadCsvReports(this.filters, reports, DEFAULT_PREFIX, this.store.projectFilters?.taxonClasses ?? [])
    this.loading = false
  }
}
