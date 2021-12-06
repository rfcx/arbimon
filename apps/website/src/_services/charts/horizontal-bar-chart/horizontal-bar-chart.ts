import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { downloadPng } from '@rfcx-bio/utils/file'

import { svgToPngData } from '~/charts'
import { clearChart } from '..'
import { generateChartExport, generateChartInternal } from './functions'
import { GroupedBarChartItem } from './types'

export default class HorizontalBarChartComponent extends Vue {
  @Prop({ default: [] }) chartData!: GroupedBarChartItem[]
  @Prop() domId!: string
  @Prop() chartTitle!: string
  @Prop() chartExportName!: string

  get hasData (): boolean {
    return this.chartData.length > 0
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

    const config = {
      width: document.getElementById(`wrapper-${id}`)?.clientWidth ?? 0,
      margins: { top: 20, right: 20, bottom: 30, left: 80 },
      fontColor: 'white'
    }

    const svg = generateChartInternal(this.chartData, config)
    if (!svg) return

    clearChart(id)
    document.getElementById(id)?.appendChild(svg)
  }

  async downloadChart (): Promise<void> {
    const config = {
      width: 1024,
      margins: { top: 40, right: 40, bottom: 50, left: 100 },
      fontColor: 'black'
    }
    const svg = generateChartExport(this.chartData, config)
    if (!svg) return

    const { width, height } = svg.viewBox.baseVal
    const png = await svgToPngData({ svg, width, height })
    downloadPng(png, this.chartExportName)
  }
}
