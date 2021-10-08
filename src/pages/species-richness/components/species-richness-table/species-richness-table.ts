import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { ChartModels } from '@/models'
import ExportButtonView from '@/views/export-button.vue'

@Options({
  components: {
    ExportButtonView
  }
})
export default class SpeciesRichnessTable extends Vue {
  @Prop({ default: [] }) tableData!: ChartModels.TableData[]

  get tableHeader (): string[] {
    return [
      'Species',
      'Class',
      ...Array.from({ length: this.datasetCount }, (v, i) => `Dataset ${i + 1}`),
      'Total'
    ]
  }

  get hasTableData (): boolean {
    return this.tableData.length > 0
  }

  get datasetCount (): number {
    return this.tableData.length > 0 ? this.tableData[0].data.length : 0
  }
}
