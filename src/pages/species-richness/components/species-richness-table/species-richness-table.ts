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
      ...(this.hasTableData ? Object.keys(this.tableData[0]).filter(k => !['speciesName', 'className'].includes(k)) : [])
    ]
  }

  get hasTableData (): boolean {
    return this.tableData.length > 0
  }
}
