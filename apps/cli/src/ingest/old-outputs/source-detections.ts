import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionBySourceSiteSpeciesHour } from '@rfcx-bio/common/dao/types'

export const createDetections = async (sequelize: Sequelize, detectionSummaries: DetectionBySourceSiteSpeciesHour[]): Promise<void> => {
  const model = ModelRepository.getInstance(sequelize).DetectionBySourceSiteSpeciesHour
  await model.bulkCreate(detectionSummaries)
}
