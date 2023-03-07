import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { downloadSvgAsPng } from '~/charts'
import { BarChartConfig, generateChartExport, GroupedBarChartItem, HorizontalBarChartComponent } from '~/charts/horizontal-bar-chart'
import { getExportGroupName } from '~/filters'

const DEFAULT_CHART_PREFIX = 'Species-By-Taxonomy'

@Options({
  components: {
    HorizontalBarChartComponent
  }
})
export default class SpeciesRichnessByClass extends Vue {
  @Prop() domId!: string
  @Prop() chartData!: GroupedBarChartItem[]
  @Prop() loading!: boolean

  get hasData (): boolean {
    return !this.loading && this.chartData.length > 0
  }

  get config (): Omit<BarChartConfig, 'width'> {
    return {
      margins: { top: 20, right: 20, bottom: 30, left: 80 },
      xTitle: 'Number of species',
      displayXAxisTick: false,
      fontColor: 'white'
    }
  }

  async downloadChart (): Promise<void> {
    const config = { ...this.config, width: 1024, displayXAxisTick: true, fontColor: 'black' }
    const svg = generateChartExport(this.chartData, config)
    if (!svg) return

    await downloadSvgAsPng(svg, getExportGroupName(DEFAULT_CHART_PREFIX))
  }
}
