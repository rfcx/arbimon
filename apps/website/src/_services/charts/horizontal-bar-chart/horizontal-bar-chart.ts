import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { downloadSvgAsPng } from '~/charts'
import { BarChartConfig } from '~/charts/horizontal-bar-chart'
import { clearChart } from '..'
import { generateChartExport, generateChartInternal } from './functions'
import { GroupedBarChartItem } from './types'

// TODO: Refactor by extract richness page information to have pure bar chart logic
export default class HorizontalBarChartComponent extends Vue {
  @Prop({ default: [] }) chartData!: GroupedBarChartItem[]
  @Prop() domId!: string
  @Prop() chartTitle!: string
  @Prop() chartExportName!: string

  get hasData (): boolean {
    return this.chartData.length > 0
  }

  get config (): BarChartConfig {
    return {
      width: document.getElementById(`wrapper-${this.domId}`)?.clientWidth ?? 0,
      margins: { top: 20, right: 20, bottom: 30, left: 80 },
      xTitle: 'Number of species',
      displayXAxisTick: false,
      fontColor: 'white'
    }
  }

  override mounted (): void {
    window.addEventListener('resize', this.renderChart)
  }

  @Watch('chartData', { deep: true })
  onChartDataChange (): void {
    this.renderChart()
  }

  renderChart (): void {
    const id = this.domId

    const svg = generateChartInternal(this.chartData, this.config)
    if (!svg) return

    clearChart(id)
    document.getElementById(id)?.appendChild(svg)
  }

  async downloadChart (): Promise<void> {
    const config = { ...this.config, width: 1024, displayXAxisTick: true, fontColor: 'black' }
    const svg = generateChartExport(this.chartData, config)
    if (!svg) return

    await downloadSvgAsPng(svg, this.chartExportName)
  }
}
