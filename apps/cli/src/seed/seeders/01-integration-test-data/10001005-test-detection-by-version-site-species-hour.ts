import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionByVersionSiteSpeciesHour } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

export const testDetectionByVersionSiteSpeciesHour: DetectionByVersionSiteSpeciesHour = {
  timePrecisionHourLocal: new Date('2021-03-18T11:00:00.000Z'),
  projectVersionId: 10001,
  projectSiteId: 10001,
  taxonSpeciesId: 1,
  taxonClassId: 600,
  countDetectionMinutes: 1
}

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  try {
    // Create summary of mocked hourly validated detections
    const detection: DetectionByVersionSiteSpeciesHour[] = [testDetectionByVersionSiteSpeciesHour]
    await ModelRepository.getInstance(getSequelize())
      .DetectionByVersionSiteSpeciesHour
      .bulkCreate(detection)
  } catch (e) {
    console.info(e)
  }
}
