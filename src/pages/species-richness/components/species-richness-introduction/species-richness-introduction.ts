import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { FileModels, SpeciesRichnessFilter } from '@/models'
import { FileUtils } from '@/utils'
import { getReportRawData } from '../../csv'

export default class SpeciesRichnessTable extends Vue {
  @Prop() filters!: SpeciesRichnessFilter[]
  @Prop() haveData!: boolean

  async exportCSVReports (): Promise<void> {
    const csvs = await Promise.all(this.filters.map(async ({ startDate, endDate, sites, color }) => {
      const start = startDate.toISOString()
      const end = endDate.add(1, 'days').toISOString()
      return await getReportRawData({ start, end, sites })
    }))

    // TODO - 106: Update filename and folder name
    const files: FileModels.File[] = await Promise.all(csvs.map(async (csv, idx) => ({
      filename: `report-${idx + 1}.csv`,
      data: await FileUtils.getCsvString(csv)
    })))
    await FileUtils.zipFiles(files, 'reports')
  }
}
