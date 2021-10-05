import * as d3 from 'd3'
import { Options, Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { ChartModels, ProjectModels } from '@/models'
import { VuexService } from '@/services'
import { exportChartWithElement } from '@/utils'
import ExportButtonView from '@/views/export-button.vue'
import { clearChart, generateChart } from '.'

@Options({
  components: {
    ExportButtonView
  }
})
export default class HorizontalBarChartComponent extends Vue {
  @Prop({ default: [] })
  chartData!: ChartModels.GroupedBarChartItem[]

  @Prop({ default: 'chart' })
  chartId!: string

  @Prop({ default: '' })
  chartTitle!: string

  @VuexService.Project.selectedProject.bind()
  selectedProject!: ProjectModels.ProjectListItem | undefined

  get hasData (): boolean {
    return this.chartData.length > 0
  }

  mounted (): void {
    d3.select(window).on('resize', (e) => {
      this.renderChart()
    })
  }

  @Watch('chartData', { deep: true })
  onChartDataChange (): void {
    this.renderChart()
  }

  renderChart (): void {
    const id = this.chartId
    const screenWidth = (document.getElementById('horizontal-bar-chart-component')?.clientWidth ?? 0)
    const config = {
      width: screenWidth,
      margins: { top: 20, right: 20, bottom: 30, left: 80 },
      fontColor: 'white'
    }
    const chart = generateChart(this.chartData, config)
    clearChart(id)
    document.getElementById(id)?.appendChild(chart)
  }

  async downloadChart (): Promise<void> {
    // TODO: 108 Update export filename (refactor and move this to util file)
    let filename = `${this.chartId}-${new Date().getTime()}`
    if (this.selectedProject?.name) {
      filename = this.selectedProject.name.replace(' ', '-') + '-' + filename
    }

    const config = {
      width: 1024,
      margins: { top: 40, right: 40, bottom: 50, left: 100 },
      fontColor: 'black'
    }
    const chart = generateChart(this.chartData, config)

    // TODO: 109 add legend if needed
    // TODO: 107 function to compute shortname of dataset to add to legend

    setTimeout(() => {
      void exportChartWithElement(chart, filename)
    }, 200)
  }
}
