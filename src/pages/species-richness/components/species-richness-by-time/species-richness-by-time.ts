import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { LineChartComponent, LineChartConfig, LineChartSeries } from '@/components/line-chart'
import { Period } from '@/services/species-service'

const PERIOD_TO_X_BOUNDS: Partial<Record<Period, [number, number]>> = {
  hour: [0, 23],
  day: [1, 31],
  month: [1, 12],
  quarter: [1, 4]
}

@Options({
  components: { LineChartComponent }
})
export default class SpeciesRichnessByTime extends Vue {
  @Prop() domId!: string
  @Prop() datasets!: Array<{color: string, data: Record<Period, Record<number, number>>}>

  periods: Period[] = ['hour', 'day', 'month', 'year', 'quarter']
  period: Period = 'hour'

  get config (): LineChartConfig {
    return {
      height: 500,
      width: 1000,
      margins: { top: 20, right: 30, bottom: 30, left: 40 },
      xBounds: PERIOD_TO_X_BOUNDS[this.period]
    }
  }

  get datasetsForPeriod (): LineChartSeries[] {
    return this.datasets.map(({ color, data }) => ({ color, data: data[this.period] ?? [] }))
  }
}
