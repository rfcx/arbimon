import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { ChartModels } from '@/models'
import ExportButtonView from '@/views/export-button.vue'

interface Header {
  title: string
  color: string
}

const DEFAULT_COLOR = '#ffffff80'

@Options({
  components: {
    ExportButtonView
  }
})
export default class SpeciesRichnessTable extends Vue {
  @Prop({ default: [] }) tableData!: ChartModels.TableData[]
  @Prop({ default: [] }) colors!: string[]

  get tableHeader (): Header[] {
    const headers = [
      { title: 'Species', color: DEFAULT_COLOR },
      { title: 'Class', color: DEFAULT_COLOR }
    ]

    if (this.hasMoreThanOneDataset) {
      headers.push(...[...Array.from({ length: this.datasetCount }, (v, i) => ({ title: `Dataset ${i + 1}`, color: this.colors[i] })), { title: 'Total', color: DEFAULT_COLOR }])
    }

    return headers
  }

  get hasTableData (): boolean {
    return this.tableData.length > 0
  }

  get hasMoreThanOneDataset (): boolean {
    return this.datasetCount > 1
  }

  get datasetCount (): number {
    return this.tableData.length > 0 ? this.tableData[0].data.length : 0
  }
}
