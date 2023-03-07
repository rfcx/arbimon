import { sum } from 'lodash-es'
import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export interface HorizontalStack {
  name: string
  count: number
  color: string
}

interface Bar {
  name: string
  percentage: number
  width: number
  color: string
}

export default class HorizontalStackedDistribution extends Vue {
  @Prop() dataset!: HorizontalStack[]
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: undefined }) knownTotalCount!: number | undefined

  get hasData (): boolean {
    return this.totalCount > 0
  }

  get totalCount (): number {
    return this.knownTotalCount ?? sum(this.dataset.map(({ count }) => count))
  }

  get bars (): Bar[] {
    // Avoid divByZero
    const totalCount = this.totalCount
    if (totalCount === 0) return []

    // Remove empty bars
    const inputs = this.dataset
      .filter(({ count }) => count > 0)

    // Calculate percentages & bar-widths (width is cumulative percentage)
    let width = 0
    const outputs: Bar[] = []

    inputs.forEach(({ name, count, color }) => {
      const percentage = count / totalCount * 100
      width += percentage

      outputs.push({
        name,
        percentage,
        width: Math.round(width),
        color
      })
    })

    return outputs
  }
}
