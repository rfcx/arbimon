import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { type BarChartConfig } from '~/charts/horizontal-bar-chart'
import { clearChart } from '..'
import { generateChartInternal } from './functions'
import { type GroupedBarChartItem } from './types'

export default class HorizontalBarChartComponent extends Vue {
  @Prop() domId!: string
  @Prop() config!: Omit<BarChartConfig, 'width'>
  @Prop() chartData!: GroupedBarChartItem[]
  @Prop({ default: false }) loading!: boolean

  get hasData (): boolean {
    return !this.loading && this.chartData.length > 0
  }

  override mounted (): void {
    window.addEventListener('resize', this.updateChart)
  }

  @Watch('chartData', { deep: true })
  onChartDataChange (): void {
    this.updateChart()
  }

  @Watch('config')
  onConfigChange (): void {
    this.updateChart()
  }

  updateChart (): void {
    const id = this.domId

    const parent = document.getElementById(id)
    if (!parent) return

    const width = (document.getElementById(`wrapper-${id}`)?.clientWidth ?? 500)
    const config = { ...this.config, width }
    const chart = generateChartInternal(this.chartData, config)
    if (!chart) return

    clearChart(id)
    document.getElementById(id)?.appendChild(chart)
  }
}
