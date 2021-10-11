import * as d3 from 'd3'
import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { clearChart } from '../horizontal-bar-chart'
import { generateChart, LineChartConfig, LineChartSeries } from '.'

export default class LineChart extends Vue {
  @Prop() domId!: string
  @Prop() config!: Omit<LineChartConfig, 'width'>
  @Prop() datasets!: LineChartSeries[]

  get hasData (): boolean {
    return this.datasets.length > 0 &&
    this.datasets.some(ds => Object.keys(ds.data).length > 0)
  }

  mounted (): void {
    this.updateChart()
    d3.select(window).on('resize', (e) => this.updateChart())
  }

  @Watch('datasets', { deep: true }) onDataChange (): void {
    this.updateChart()
  }

  updateChart (): void {
    const parent = document.getElementById(this.domId)
    if (!parent) return

    const width = (document.getElementById(`wrapper-${this.domId}`)?.clientWidth ?? 500)
    const config = { ...this.config, width }
    console.log(config)
    const chart = generateChart(this.datasets, config)
    if (!chart) return

    // TODO 20 - I don't like that we need to select twice...
    clearChart(this.domId)
    parent.appendChild(chart)
  }
}
