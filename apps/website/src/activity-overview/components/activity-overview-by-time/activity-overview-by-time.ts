import { isEmpty } from 'lodash-es'
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { downloadPng } from '@rfcx-bio/utils/file'

import { TimeDataset } from '@/activity-overview/types'
import { ACTIVITY_OVERVIEW_TIME_KEYS, ActivityOverviewDataByTimeBucket } from '~/api/activity-overview-service'
import { svgToPngData } from '~/charts'
import { generateChartExport, LineChartComponent, LineChartConfig, LineChartSeries } from '~/charts/line-chart'
import { getExportGroupName } from '~/filters'
import { TIME_BUCKET_BOUNDS, TIME_BUCKET_LABELS, TIME_LABELS, TimeBucket } from '~/time-buckets'

type ActivityOverviewDataByTimeType = keyof ActivityOverviewDataByTimeBucket

// TODO ???: Reduce and move to somewhere for center use
interface DropDownOption {
  label: string
  value: ActivityOverviewDataByTimeType
}

@Options({
  components: {
    LineChartComponent
  }
})
export default class ActivityOverviewByTime extends Vue {
  @Prop() domId!: string
  @Prop() datasets!: TimeDataset[]

  selectedType: ActivityOverviewDataByTimeType = ACTIVITY_OVERVIEW_TIME_KEYS.detectionFrequency
  datasetType: DropDownOption[] = [
    { label: 'Detection Frequency', value: ACTIVITY_OVERVIEW_TIME_KEYS.detectionFrequency },
    { label: 'Detections (raw)', value: ACTIVITY_OVERVIEW_TIME_KEYS.detection }
  ]

  selectedBucket: TimeBucket = 'hourOfDay'
  buckets: Record<TimeBucket, string> = TIME_BUCKET_LABELS

  get config (): Omit<LineChartConfig, 'width'> {
    return {
      height: 450,
      margins: { top: 20, right: 30, bottom: 30, left: 40 },
      xBounds: TIME_BUCKET_BOUNDS[this.selectedBucket],
      xLabels: TIME_LABELS[this.selectedBucket]
    }
  }

  get hasData (): boolean {
    return this.datasetsForSelectedBucket.some(({ data }) => !isEmpty(data))
  }

  get datasetsForSelectedBucket (): LineChartSeries[] {
    return this.datasets.map(({ color, data }) => ({ color, data: data[this.selectedBucket][this.selectedType] ?? [] }))
  }

  async downloadChart (): Promise<void> {
    const margins = { ...this.config.margins, bottom: 80, left: 80 }
    const exportConfig = { ...this.config, margins, width: 1024, height: 576 }
    const svg = generateChartExport(this.datasetsForSelectedBucket, exportConfig)
    if (!svg) return

    const png = await svgToPngData({ svg, ...exportConfig })
    console.log(getExportGroupName(`${this.domId}-${this.selectedBucket}`))
    downloadPng(png, getExportGroupName(`${this.domId}-${this.selectedBucket}`))
  }
}
