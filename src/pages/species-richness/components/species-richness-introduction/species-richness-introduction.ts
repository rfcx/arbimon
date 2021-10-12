import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { FileModels, SpeciesRichnessFilter } from '@/models'
import { FileUtils, FilterUtils } from '@/utils'
import { downloadZip } from '@/utils/file'
import { getReportRawData } from '../../csv'

const DEFAULT_PREFIX = 'Species-Richness-Raw-Data'

export default class SpeciesRichnessTable extends Vue {
  @Prop() filters!: SpeciesRichnessFilter[]
  @Prop() haveData!: boolean

  async exportCSVReports (): Promise<void> {
    const csvData = await Promise.all(this.filters.map(async ({ startDate, endDate, sites, color }) => {
      const start = startDate.toISOString()
      const end = endDate.add(1, 'days').toISOString()
      return await getReportRawData({ start, end, sites })
    }))

    const allDates = this.filters.flatMap(({ startDate, endDate }) => (Object.values({ startDate, endDate })))
    const dateGroup = FilterUtils.getDateGroup(allDates)
    const folderName = FilterUtils.getFilterExportGroupName(this.filters, DEFAULT_PREFIX)
    const filenames = this.filters.map(({ startDate, endDate, sites }) => FilterUtils.getFilterExportName(startDate, endDate, DEFAULT_PREFIX, dateGroup, sites))

    const files: FileModels.File[] = await Promise.all(csvData.map(async (csvDatum, idx) => ({
      filename: `${filenames[idx]}.csv`,
      data: await FileUtils.toCsv(csvDatum)
    })))

    const zipUrl = await FileUtils.zipFiles(files, folderName)
    downloadZip(zipUrl, folderName)
  }
}
