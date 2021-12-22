import { sum } from 'lodash-es'
import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

interface Bar {
  name: string
  percentage: number
  width: number
  color: string
}

const DEFAULT_COLOR = '#FFFFFF'

export default class DashboardTopTaxons extends Vue {
  @Prop() dataset!: Array<[string, number]>
  @Prop() colors!: Record<string, string>
  @Prop({ default: undefined }) knownTotalCount!: number | undefined

  get hasData (): boolean {
    return this.totalCount > 0
  }

  get totalCount (): number {
    return this.knownTotalCount ?? sum(this.dataset.map(([_, count]) => count))
  }

  get bars (): Bar[] {
    // Avoid divByZero
    const totalCount = this.totalCount
    if (totalCount === 0) return []

    // Remove empty bars & sort
    const inputs = this.dataset
      .filter(([, count]) => count > 0)

    // Calculate percentages & bar-widths (width is cumulative percentage)
    let width = 0
    const outputs: Bar[] = []

    inputs.forEach(([name, count]) => {
      const percentage = count / totalCount * 100
      width += percentage

      outputs.push({
        name,
        percentage,
        width: Math.round(width),
        color: this.colors[name] ?? DEFAULT_COLOR
      })
    })

    return outputs
  }
}
