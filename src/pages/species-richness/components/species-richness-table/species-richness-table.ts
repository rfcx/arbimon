import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { ChartModels } from '@/models'
import ExportButtonView from '@/views/export-button.vue'

interface Header {
  title: string
  color: string
}

@Options({
  components: {
    ExportButtonView
  }
})
export default class SpeciesRichnessTable extends Vue {
  @Prop({ default: [] }) tableData!: ChartModels.TableData[]
  @Prop({ default: [] }) colors!: string[]

  get tableHeader (): Header[] {
    const defaultColor = '#ffffff80'
    return [
      {
        title: 'Species',
        color: defaultColor
      },
      {
        title: 'Class',
        color: defaultColor
      },
      ...Array.from({ length: this.datasetCount }, (v, i) => ({ title: `Dataset ${i + 1}`, color: this.colors[i] })),
      {
        title: 'Total',
        color: defaultColor
      }
    ]
  }

  get hasTableData (): boolean {
    return this.tableData.length > 0
  }

  get datasetCount (): number {
    return this.tableData.length > 0 ? this.tableData[0].data.length : 0
  }
}
