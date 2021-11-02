import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { clearChart, exportChartWithElement } from '..'
import { generateChart, GroupedBarChartItem } from '.'

export default class HorizontalBarChartComponent extends Vue {
  @Prop({ default: [] }) chartData!: GroupedBarChartItem[]
  @Prop() domId!: string
  @Prop() chartTitle!: string
  @Prop() chartExportName!: string

  get hasData (): boolean {
    return this.chartData.length > 0
  }

  mounted (): void {
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

    const chart = generateChart(this.chartData, config)
    if (!chart) return

    clearChart(id)
    document.getElementById(id)?.appendChild(chart)
  }

  async downloadChart (): Promise<void> {
    const config = {
      width: 1024,
      margins: { top: 40, right: 40, bottom: 50, left: 100 },
      fontColor: 'black'
    }
    const chart = generateChart(this.chartData, config, true)
    if (!chart) return

    // TODO: 109 add legend if needed
    // TODO: 107 function to compute shortname of dataset to add to legend
    setTimeout(() => {
      void exportChartWithElement(chart, this.chartExportName)
    }, 200)
  }
}
