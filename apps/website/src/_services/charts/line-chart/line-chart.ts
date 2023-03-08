import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { clearChart } from '..'
import { generateChartInternal } from './functions'
import { type LineChartConfig, type LineChartSeries } from './types'

export default class LineChartComponent extends Vue {
  @Prop() domId!: string
  @Prop() config!: Omit<LineChartConfig, 'width'>
  @Prop() datasets!: LineChartSeries[]
  @Prop({ default: false }) loading!: boolean

  get hasData (): boolean {
    return !this.loading && this.datasets.some(ds => Object.values(ds.data).some(val => val > 0))
  }

  override mounted (): void {
    window.addEventListener('resize', this.updateChart)
  }

  @Watch('datasets', { deep: true }) onDataChange (): void {
    this.updateChart()
  }

  @Watch('config')
  onConfigChange (): void {
    this.updateChart()
  }

  updateChart (): void {
    const parent = document.getElementById(this.domId)
    if (!parent) return

    const width = (document.getElementById(`wrapper-${this.domId}`)?.clientWidth ?? 500)
    const config = { ...this.config, width }
    const chart = generateChartInternal(this.datasets, config)
    if (!chart) return

    clearChart(this.domId)
    parent.appendChild(chart)
  }
}
