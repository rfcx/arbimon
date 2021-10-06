import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { ChartModels } from '@/models'

export default class SpeciesRichnessTable extends Vue {
  @Prop({ default: [] }) tableData!: ChartModels.TableData[]

  get tableHeader (): string[] {
    return [
      'Species',
      'Class',
      ...(this.hasData ? Object.keys(this.tableData[0]).filter(k => !['speciesName', 'className'].includes(k)) : [])
    ]
  }

  get hasData (): boolean {
    return this.tableData.length > 0
  }
}
