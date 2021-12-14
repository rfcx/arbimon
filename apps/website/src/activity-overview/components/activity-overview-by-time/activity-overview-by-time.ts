import { isEmpty } from 'lodash-es'
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { TimeDataset } from '@/activity-overview/types'
import { ACTIVITY_OVERVIEW_TIME_KEYS, ActivityOverviewDataByTimeBucket } from '~/api/activity-overview-service'
import { TimeBucket } from '~/api/species-richness-service'
import { LineChartComponent, LineChartConfig, LineChartSeries } from '~/charts/line-chart'

type ActivityOverviewDataByTimeType = keyof ActivityOverviewDataByTimeBucket

// TODO ???: Reduce and move to somewhere for center use
interface DropDownOption {
  label: string
  value: ActivityOverviewDataByTimeType
}

// TODO ???: Reduce and move to somewhere for center use
const BUCKETS_TO_X_BOUNDS: Partial<Record<TimeBucket, [number, number]>> = {
  hour: [0, 23],
  day: [1, 31],
  month: [1, 12],
  quarter: [1, 4]
}

@Options({
  components: {
    LineChartComponent
  }
})
export default class ActivityOverviewByTime extends Vue {
  @Prop() domId!: string
  @Prop() datasets!: TimeDataset[]

  selectedType: ActivityOverviewDataByTimeType = ACTIVITY_OVERVIEW_TIME_KEYS.detection
  datasetType: DropDownOption[] = [
    { label: 'Detection Frequency', value: ACTIVITY_OVERVIEW_TIME_KEYS.detectionFrequency },
    { label: 'Detections', value: ACTIVITY_OVERVIEW_TIME_KEYS.detection }
  ]

  buckets: TimeBucket[] = ['hour', 'day', 'month', 'year', 'quarter']
  selectedBucket: TimeBucket = 'hour'

  get config (): Omit<LineChartConfig, 'width'> {
    return {
      height: 450,
      margins: { top: 20, right: 30, bottom: 30, left: 40 },
      xBounds: BUCKETS_TO_X_BOUNDS[this.selectedBucket]
    }
  }

  get hasData (): boolean {
    return this.datasetsForSelectedBucket.some(({ data }) => !isEmpty(data))
  }

  get datasetsForSelectedBucket (): LineChartSeries[] {
    return this.datasets.map(({ color, data }) => ({ color, data: data[this.selectedBucket][this.selectedType] ?? [] }))
  }
}
