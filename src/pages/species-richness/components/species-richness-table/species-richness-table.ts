import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { ChartModels } from '@/models'

export default class SpeciesRichnessTable extends Vue {
  @Prop({ default: [] }) datasets!: ChartModels.TableData[]

  get tableHeader (): string[] {
    const headers = [
      'Species name',
      'Class'
    ]

    if (this.hasData) {
      headers.push(...Object.keys(this.datasets[0]).filter(k => !['speciesName', 'speciesClassname'].includes(k)))
    }

    console.log(headers)

    return headers
  }

  get hasData (): boolean {
    return this.datasets.length > 0
  }
}
