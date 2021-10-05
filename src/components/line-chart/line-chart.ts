import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { generateChart, LineChartConfig, LineChartSeries } from '.'

const PERIOD_TO_FORCED_X: Record<string, number> = {
  hour: 24,
  day: 28,
  month: 12,
  quarter: 4
}

export default class LineChart extends Vue {
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
    }
  ]

  allPeriods = ['hour', 'day', 'month', 'year', 'quarter']
  period = 'hour'

  config: LineChartConfig = {
    height: 500,
    width: 1000,
    margins: { top: 20, right: 30, bottom: 30, left: 40 }
  }

  get hasData (): boolean { return this.datasets.length > 0 }

  mounted (): void {
    this.updateChart()
  }

  @Watch('datasets') onDataChange (): void {
    this.updateChart()
  }

  updateChart (): void {
    const data = this.groupDataByPeriod()
    const xSeries = this.getXSeries(data)

    const chart = generateChart(xSeries, data, this.config)
    if (!chart) return

    document.getElementById(this.domId)?.appendChild(chart)
  }

  groupDataByPeriod (): LineChartSeries[] {
    return this.datasets // TODO 20: Implement this once we inject ungrouped data
  }

  getXSeries (data: LineChartSeries[]): number[] {
    // Force 0-24 hour, 0-12 months, etc
    const xForced = Array.from({ length: PERIOD_TO_FORCED_X[this.period] ?? 0 }, (_, i) => i)
    // Add real values (ex: 2020, 2021)
    const xActual = data.flatMap(s => Object.keys(s.data).map(Number))
    return Array.from(new Set([...xForced, ...xActual])).sort((a, b) => a - b)
  }
}
