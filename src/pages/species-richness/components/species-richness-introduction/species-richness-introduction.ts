import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { FileModels, SpeciesRichnessFilter } from '@/models'
import { FileUtils } from '@/utils'
import { downloadZip } from '@/utils/file'
import { getReportRawData } from '../../csv'

export default class SpeciesRichnessIntroduction extends Vue {
  @Prop() filters!: SpeciesRichnessFilter[]
  @Prop() haveData!: boolean

  async exportCSVReports (): Promise<void> {
    const csvData = await Promise.all(this.filters.map(async ({ startDate, endDate, sites, color }) => {
      const start = startDate.toISOString()
      const end = endDate.add(1, 'days').toISOString()
      return await getReportRawData({ start, end, sites })
    }))

    // TODO - 106: Update filename and folder name
    const files: FileModels.File[] = await Promise.all(csvData.map(async (csvDatum, idx) => ({
      filename: `report-${idx + 1}.csv`,
      data: await FileUtils.toCsv(csvDatum)
    })))

    const folderName = 'reports'
    const zipUrl = await FileUtils.zipFiles(files, folderName)
    downloadZip(zipUrl, folderName)
  }
}
