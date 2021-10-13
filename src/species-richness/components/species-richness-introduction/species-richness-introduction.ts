import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { ColoredFilter } from '@/_components/datasets'
import { FileUtils, FilterUtils } from '@/_services/utils'
import { downloadZip, FileData } from '@/_services/utils/file'
import { getReportRawData } from '../../csv'

const DEFAULT_PREFIX = 'Species-Richness-Raw-Data'

export default class SpeciesRichnessIntroduction extends Vue {
  @Prop() filters!: ColoredFilter[]
  @Prop() haveData!: boolean

  async exportCSVReports (): Promise<void> {
    const csvData = await Promise.all(this.filters.map(async ({ startDate, endDate, sites, color }) => {
      const start = startDate.toISOString()
      const end = endDate.add(1, 'days').toISOString()
      return await getReportRawData({ start, end, sites })
    }))

    const { name, exportTime } = FilterUtils.getFilterExportGroupName(this.filters, DEFAULT_PREFIX)
    const filenames = this.filters.map(({ startDate, endDate, sites }) => FilterUtils.getFilterExportName(startDate, endDate, DEFAULT_PREFIX, exportTime, sites))

    const files: FileData[] = await Promise.all(csvData.map(async (csvDatum, idx) => ({
      filename: `${filenames[idx]}.csv`,
      data: await FileUtils.toCsv(csvDatum)
    })))

    const zipUrl = await FileUtils.zipFiles(files, name)
    downloadZip(zipUrl, name)
  }
}
