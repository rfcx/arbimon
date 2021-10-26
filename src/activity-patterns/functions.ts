import { ActivityPatternsData } from '~/api/activity-patterns-service'
import { ColoredFilter } from '~/dataset-filters'
import { Metrics } from './types'

export function transformToMetricsDatasets (datasets: Array<ColoredFilter & { data: ActivityPatternsData }>): Metrics[] {

}
