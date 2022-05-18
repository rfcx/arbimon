import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionBySourceSiteSpeciesHour, DetectionByVersionSiteSpeciesHour } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { testDetectionBySourceSiteSpeciesHour, testDetectionBySourceSiteSpeciesHour2, testDetectionBySourceSiteSpeciesHour3 } from '@/seed/data/integration/detection-by-source-site-species-hour'
import { testDetectionByVersionSiteSpeciesHour, testDetectionByVersionSiteSpeciesHour2, testDetectionByVersionSiteSpeciesHour3 } from '@/seed/data/integration/detection-by-version-site-species-hour'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // Create summary of mocked hourly validated detections
  const detection: DetectionByVersionSiteSpeciesHour[] = [
    testDetectionByVersionSiteSpeciesHour,
    testDetectionByVersionSiteSpeciesHour2,
    testDetectionByVersionSiteSpeciesHour3
  ]
  await ModelRepository.getInstance(getSequelize())
    .DetectionByVersionSiteSpeciesHour
    .bulkCreate(detection)

  // Create summary of mocked validated detections
  const detectionBySource: DetectionBySourceSiteSpeciesHour[] = [
    testDetectionBySourceSiteSpeciesHour,
    testDetectionBySourceSiteSpeciesHour2,
    testDetectionBySourceSiteSpeciesHour3
  ]
  await ModelRepository.getInstance(getSequelize())
    .DetectionBySourceSiteSpeciesHour
    .bulkCreate(detectionBySource)
}
