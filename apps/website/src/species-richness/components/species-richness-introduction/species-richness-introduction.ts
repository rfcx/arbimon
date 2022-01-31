import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { isDefined } from '@rfcx-bio/utils/predicates'

import { INFO_TOPICS } from '@/info/info-page'
import { downloadCsvReports } from '@/species-richness/csv'
import { ColoredFilter, filterToDataset } from '~/filters'
import { richnessService } from '../../services'

const DEFAULT_PREFIX = 'Species-Richness-Raw-Data'

export default class SpeciesRichnessIntroduction extends Vue {
  @Prop() filters!: ColoredFilter[]
  @Prop() haveData!: boolean

  loading = false

  get infoTopic (): string {
    return INFO_TOPICS.richness
  }

  // TODO ??? - I think Vue 3 composition API would let us simply import the function (instead of proxying it)
  async exportCsvReports (): Promise<void> {
    this.loading = true
    const datasets = (await Promise.all(
      this.filters.map(async (filter) => {
        return await richnessService.getRichnessByExport(filterToDataset(filter))
      })
    )).filter(isDefined)
    await downloadCsvReports(this.filters, datasets, DEFAULT_PREFIX)
    this.loading = false
  }
}
