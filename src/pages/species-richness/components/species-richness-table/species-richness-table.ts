import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import XLSX from 'xlsx'

import { ChartModels } from '@/models'
import ExportButtonView from '@/views/export-button.vue'

@Options({
  components: {
    ExportButtonView
  }
})
export default class SpeciesRichnessTable extends Vue {
  @Prop({ default: [] }) tableData!: ChartModels.TableData[]
  @Prop({ default: [] }) reportData!: []

  get tableHeader (): string[] {
    const headers = [
      'Species name',
      'Class'
    ]

    if (this.hasTableData) {
      headers.push(...Object.keys(this.tableData[0]).filter(k => !['speciesName', 'className'].includes(k)))
    }

    return headers
  }

  get hasTableData (): boolean {
    return this.tableData.length > 0
  }

  get hasReportData (): boolean {
    return this.reportData.length > 0
  }

  exportCSVReport (): void {
    const filename = 'report.csv'
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(this.reportData)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Species Report')
    XLSX.writeFile(workbook, filename, { bookType: 'csv' })
  }
}
