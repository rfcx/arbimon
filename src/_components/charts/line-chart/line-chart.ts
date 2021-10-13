import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { clearChart } from '@/_services/utils'
import { generateChart, LineChartConfig, LineChartSeries } from '.'

export default class LineChartComponent extends Vue {
  @Prop() domId!: string
  @Prop() config!: Omit<LineChartConfig, 'width'>
  @Prop() datasets!: LineChartSeries[]

  get hasData (): boolean {
    return this.datasets.length > 0 && this.datasets.some(ds => Object.keys(ds.data).length > 0)
  }

  mounted (): void {
    window.addEventListener('resize', this.updateChart)
  }

  @Watch('datasets', { deep: true }) onDataChange (): void {
    this.updateChart()
  }

  updateChart (): void {
    const parent = document.getElementById(this.domId)
    if (!parent) return

    const width = (document.getElementById(`wrapper-${this.domId}`)?.clientWidth ?? 500)
    const config = { ...this.config, width }
    const chart = generateChart(this.datasets, config)
    if (!chart) return

    clearChart(this.domId)
    parent.appendChild(chart)
  }
}
