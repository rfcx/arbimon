import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionBySourceSiteSpeciesHour } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

export const testDetectionBySourceSiteSpeciesHour: DetectionBySourceSiteSpeciesHour = {
  timePrecisionHourLocal: new Date('2021-03-18T11:00:00.000Z'),
  sourceId: 10001,
  projectSiteId: 10001,
  taxonSpeciesId: 1,
  detectionMinutes: '10'
}

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // Create summary of mocked validated detections
  const detectionBySource: DetectionBySourceSiteSpeciesHour[] = [testDetectionBySourceSiteSpeciesHour]
  await ModelRepository.getInstance(getSequelize())
    .DetectionBySourceSiteSpeciesHour
    .bulkCreate(detectionBySource)
}
