import { groupBy } from 'lodash'

import { DatasetDefinition } from '~/api'
import { ApiHourlySpeciesSummary, filterByDataset, getRawDetections } from '~/api-helpers/mock'

export class ActivityOverviewService {
  constructor (
    private readonly rawHourlySpeciesSummaries: ApiHourlySpeciesSummary[],
    private readonly delay: number | undefined = undefined
  ) {}

  async getActivityOverviewData (dataset: DatasetDefinition): Promise<void> {
    const totalDetections = filterByDataset(this.rawHourlySpeciesSummaries, dataset)
    const detectionsByTaxon = groupBy(totalDetections, 'taxon')
  }
}

export const activityOverviewService = new ActivityOverviewService(getRawDetections())
