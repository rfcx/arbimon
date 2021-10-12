import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { SpeciesRichnessFilter } from '@/models'
import { FileUtils } from '@/utils'
import { getReportRawData } from '../../csv'

export default class SpeciesRichnessIntroduction extends Vue {
  @Prop() filters!: SpeciesRichnessFilter[]
  @Prop() haveData!: boolean

  async exportCSVReport (): Promise<void> {
    const csvs = await Promise.all(this.filters.map(async ({ startDate, endDate, sites, color }) => {
      const start = startDate.toISOString()
      const end = endDate.add(1, 'days').toISOString()
      return await getReportRawData({ start, end, sites })
    }))

    const filename = 'report.csv'
    // TODO 106 - Support multiple datasets
    await FileUtils.exportCSVFile(filename, csvs[0], 'Species Report')
  }
}
