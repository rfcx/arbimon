import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { downloadCsvReports } from '@/species-richness/csv'
import { ColoredFilter } from '~/filters'

const DEFAULT_PREFIX = 'Species-Richness-Raw-Data'

export default class SpeciesRichnessIntroduction extends Vue {
  @Prop() filters!: ColoredFilter[]
  @Prop() haveData!: boolean

  // TODO ??? - I think Vue 3 composition API would let us simply import the function (instead of proxying it)
  async exportCsvReports (): Promise<void> {
    await downloadCsvReports(this.filters, DEFAULT_PREFIX)
  }
}
