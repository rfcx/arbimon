import { sum } from 'lodash-es'
import { Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { RouteNames } from '~/router'
import { BiodiversityStore } from '~/store'

interface Bar {
  name: string
  percentage: number
  width: number
  color: string
}

const DEFAULT_COLOR = '#FFFFFF'

export default class DashboardTopTaxons extends Vue {
  @Inject() readonly ROUTE_NAMES!: RouteNames
  @Inject() readonly store!: BiodiversityStore

  @Prop() dataset!: Record<string, number>
  @Prop() colors!: Record<string, string>
  @Prop({ default: undefined }) knownTotalCount!: number | undefined

  get hasData (): boolean {
    return this.totalCount > 0
  }

  get totalCount (): number {
    return this.knownTotalCount ?? sum(Object.values(this.dataset))
  }

  get bars (): Bar[] {
    // Avoid divByZero
    const totalCount = this.totalCount
    if (totalCount === 0) return []

    // Remove empty bars & sort
    const inputs = Object.entries(this.dataset)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))

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
