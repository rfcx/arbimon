import numeral from 'numeral'
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { LAYOUT_BREAKPOINT } from '@/_layout/config'
import { downloadSvgAsPng } from '~/charts'
import { type LineChartConfig, type LineChartSeries, generateChartExport, LineChartComponent } from '~/charts/line-chart'
import { getExportGroupName } from '~/filters'
import { type TimeBucket, TIME_BUCKET_BOUNDS, TIME_BUCKET_LABELS, TIME_LABEL_FORMATTERS } from '~/time-buckets'

@Options({
  components: { LineChartComponent }
})
export default class SpeciesRichnessByTime extends Vue {
  @Prop() domId!: string
  @Prop() datasets!: Array<{ color: string, data: Record<TimeBucket, Record<number, number>> }>
  @Prop({ default: false }) loading!: boolean

  selectedBucket: TimeBucket = 'hourOfDay'
  buckets: Record<TimeBucket, string> = TIME_BUCKET_LABELS
  chartHeight = screen.width > LAYOUT_BREAKPOINT.sm ? 450 : 250

  get hasData (): boolean {
    return this.datasetsForSelectedBucket
      .some(ds => Object.values(ds.data).some(val => val > 0))
  }

  get config (): Omit<LineChartConfig, 'width'> {
    return {
      height: this.chartHeight,
      margins: { top: 20, right: 10, bottom: 30, left: 40 },
      xTitle: TIME_BUCKET_LABELS[this.selectedBucket],
      yTitle: 'Number of species',
      xBounds: TIME_BUCKET_BOUNDS[this.selectedBucket],
      xLabelFormatter: this.selectedBucket === 'date'
        ? n => dayjs.unix(n).format('MMM-DD YY')
        : TIME_LABEL_FORMATTERS[this.selectedBucket],
      yLabelFormatter: (n) => Number.isInteger(n) ? numeral(n).format('0,0') : ''
    }
  }

  get datasetsForSelectedBucket (): LineChartSeries[] {
    return this.datasets.map(({ color, data }) => ({ color, data: data[this.selectedBucket] ?? [] }))
  }

  override created (): void {
    window.addEventListener('resize', () => {
      this.chartHeight = screen.width > LAYOUT_BREAKPOINT.sm ? 450 : 250
    })
  }

  async downloadChart (): Promise<void> {
    const margins = { ...this.config.margins, bottom: 80, left: 80 }
    const exportConfig = { ...this.config, margins, width: 1024, height: 576 }
    const svg = generateChartExport(this.datasetsForSelectedBucket, exportConfig)
    if (!svg) return

    await downloadSvgAsPng(svg, getExportGroupName(`${this.domId}-${this.selectedBucket}`))
  }
}
