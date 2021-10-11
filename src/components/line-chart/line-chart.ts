import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { generateChart, LineChartConfig, LineChartSeries } from '.'

export default class LineChart extends Vue {
  @Prop() domId!: string
  @Prop() config!: LineChartConfig
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

  get hasData (): boolean {
    return this.datasets.length > 0 &&
    this.datasets.some(ds => Object.keys(ds.data).length > 0)
  }

  mounted (): void {
    this.updateChart()
  }

  @Watch('datasets') onDataChange (): void {
    this.updateChart()
  }

  updateChart (): void {
    const chart = generateChart(this.datasets, this.config)
    if (chart) document.getElementById(this.domId)?.appendChild(chart)
  }
}
