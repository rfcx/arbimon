import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SourceDetectionBySyncSiteSpeciesHour } from '@rfcx-bio/common/dao/types'

export const createDetections = async (sequelize: Sequelize, detectionSummaries: SourceDetectionBySyncSiteSpeciesHour[]): Promise<void> => {
  const model = ModelRepository.getInstance(sequelize).SourceDetectionBySyncSiteSpeciesHour
  await model.bulkCreate(detectionSummaries)
}
