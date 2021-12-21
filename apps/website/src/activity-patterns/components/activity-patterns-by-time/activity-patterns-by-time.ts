import { isEmpty } from 'lodash-es'
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { downloadPng } from '@rfcx-bio/utils/file'

import { TimeDataset } from '@/activity-patterns/types'
import { ACTIVITY_PATTERN_TIME_KEYS, ActivityPatternsDataByTimeBucket } from '~/api/activity-patterns-service'
import { svgToPng } from '~/charts'
import { generateChartExport, LineChartComponent, LineChartConfig, LineChartSeries } from '~/charts/line-chart'
import { getExportGroupName } from '~/filters'
import { TIME_BUCKET_BOUNDS, TIME_BUCKET_LABELS, TIME_LABELS, TimeBucket } from '~/time-buckets'

type ActivityPatternsDataByTimeType = keyof ActivityPatternsDataByTimeBucket

// TODO ???: Reduce and move to somewhere for center use
interface DropDownOption {
  label: string
  value: ActivityPatternsDataByTimeType
}

const DATASET_LABELS = {
  [ACTIVITY_PATTERN_TIME_KEYS.detectionFrequency]: 'Detection Frequency',
  [ACTIVITY_PATTERN_TIME_KEYS.detection]: 'Detections (raw)'
}

@Options({
  components: {
    LineChartComponent
  }
})
export default class ActivityPatternsByTime extends Vue {
  @Prop() domId!: string
  @Prop() datasets!: TimeDataset[]

  selectedType: ActivityPatternsDataByTimeType = ACTIVITY_PATTERN_TIME_KEYS.detectionFrequency
  datasetType: DropDownOption[] = [
    { label: DATASET_LABELS[ACTIVITY_PATTERN_TIME_KEYS.detection], value: ACTIVITY_PATTERN_TIME_KEYS.detectionFrequency },
    { label: DATASET_LABELS[ACTIVITY_PATTERN_TIME_KEYS.detection], value: ACTIVITY_PATTERN_TIME_KEYS.detection }
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

  get datasetsForSelectedBucket (): LineChartSeries[] {
    return this.datasets.map(({ color, data }) => ({ color, data: data[this.selectedBucket][this.selectedType] ?? [] }))
  }

  get hasData (): boolean {
    return this.datasetsForSelectedBucket.some(({ data }) => !isEmpty(data))
  }

  async downloadChart (): Promise<void> {
    const margins = { ...this.config.margins, bottom: 80, left: 80 }
    const exportConfig = { ...this.config, margins, width: 1024, height: 576 }
    const svg = await generateChartExport(this.datasetsForSelectedBucket, exportConfig, TIME_BUCKET_LABELS[this.selectedBucket], DATASET_LABELS[this.selectedType])
    if (!svg) return

    const png = await svgToPng({ svg, ...exportConfig })
    downloadPng(png, getExportGroupName(`${this.domId}-${this.selectedBucket}`)) // TODO 107 - Better filename
  }
}
