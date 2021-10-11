import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { LineChartComponent, LineChartConfig, LineChartSeries } from '@/components/line-chart'

const PERIOD_TO_X_BOUNDS: Record<string, [number, number]> = {
  hour: [0, 23],
  day: [1, 28],
  month: [1, 12],
  quarter: [1, 4]
}

@Options({
  components: { LineChartComponent }
})
export default class SpeciesRichnessByTime extends Vue {
  @Prop() domId!: string
  @Prop() datasets: LineChartSeries[] = [ // TODO 20: Inject real datasets
    {
      color: '#499FE6',
      data: {
        2: 10,
        3: 12,
        4: 20,
        9: 90,
        10: 110,
        12: 100,
        13: 200
      }
    },
    {
      color: '#EAAE39',
      data: {
        4: 1,
        5: 2,
        6: 4,
        7: 8,
        8: 16,
        9: 32,
        10: 64,
        11: 128,
        12: 64,
        13: 32,
        14: 16,
        15: 8,
        16: 4,
        17: 2,
        18: 1,
        19: 2,
        20: 4,
        21: 4,
        22: 2,
        23: 1
      }
    }
  ]

  allPeriods = ['hour', 'day', 'month', 'year', 'quarter']
  period = 'hour'

  get config (): LineChartConfig {
    return {
      height: 500,
      width: 1000,
      margins: { top: 20, right: 30, bottom: 30, left: 40 },
      xBounds: PERIOD_TO_X_BOUNDS[this.period]
    }
  }
}
