import { isEmpty } from 'lodash-es'
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { downloadPng } from '@rfcx-bio/utils/file'

import { svgToPng } from '~/charts'
import { generateChartExport, LineChartComponent, LineChartConfig, LineChartSeries } from '~/charts/line-chart'
import { getExportGroupName } from '~/filters'
import { TIME_BUCKET_BOUNDS, TIME_BUCKET_LABELS, TIME_LABELS, TimeBucket } from '~/time-buckets'

@Options({
  components: { LineChartComponent }
})
export default class SpeciesRichnessByTime extends Vue {
  @Prop() domId!: string
  @Prop() datasets!: Array<{color: string, data: Record<TimeBucket, Record<number, number>>}>

  selectedBucket: TimeBucket = 'hourOfDay'
  buckets: Record<TimeBucket, string> = TIME_BUCKET_LABELS

  get hasData (): boolean {
    return this.datasetsForSelectedBucket.some(ds => !isEmpty(ds.data))
  }

  get config (): Omit<LineChartConfig, 'width'> {
    return {
      height: 450,
      margins: { top: 20, right: 30, bottom: 30, left: 40 },
      xBounds: TIME_BUCKET_BOUNDS[this.selectedBucket],
      xLabels: TIME_LABELS[this.selectedBucket]
    }
  }

  get datasetsForSelectedBucket (): LineChartSeries[] {
    return this.datasets.map(({ color, data }) => ({ color, data: data[this.selectedBucket] ?? [] }))
  }

  async downloadChart (): Promise<void> {
    const margins = { ...this.config.margins, bottom: 80, left: 80 }
    const exportConfig = { ...this.config, margins, width: 1024, height: 576 }
    const svg = generateChartExport(this.datasetsForSelectedBucket, exportConfig, TIME_BUCKET_LABELS[this.selectedBucket], 'Number of species')
    if (!svg) return

    const png = await svgToPng({ svg, ...exportConfig })
    downloadPng(png, getExportGroupName(`${this.domId}-${this.selectedBucket}`))
  }
}
