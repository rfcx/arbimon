import { OnClickOutside } from '@vueuse/components'
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { ColoredFilter } from '~/dataset-filters'
import { getFilterExportGroupName, getFilterExportName } from '~/dataset-filters/functions'
import { downloadZip, FileData, toCsv, zipFiles } from '~/utils/file'
import { getReportRawData } from '../../csv'

const DEFAULT_PREFIX = 'Species-Richness-Raw-Data'

@Options({
  components: {
    OnClickOutside
  }
})
export default class SpeciesRichnessIntroduction extends Vue {
  @Prop() filters!: ColoredFilter[]
  @Prop() haveData!: boolean

  isDropdownOpen = false

  async exportCSVReports (): Promise<void> {
    const csvData = await Promise.all(this.filters.map(async ({ startDate, endDate, sites, color }) => {
      const start = startDate.toISOString()
      const end = endDate.add(1, 'days').toISOString()
      return await getReportRawData({ start, end, sites })
    }))

    const { name, exportTime } = getFilterExportGroupName(this.filters, DEFAULT_PREFIX)
    const filenames = this.filters.map(({ startDate, endDate, sites }) => getFilterExportName(startDate, endDate, DEFAULT_PREFIX, exportTime, sites))

    const files: FileData[] = await Promise.all(csvData.map(async (csvDatum, idx) => ({
      filename: `${filenames[idx]}.csv`,
      data: await toCsv(csvDatum)
    })))

    const zipUrl = await zipFiles(files, name)
    downloadZip(zipUrl, name)
  }

  openDropdown (open: boolean): void {
    this.isDropdownOpen = open
  }
}
