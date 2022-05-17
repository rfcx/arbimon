import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { RecordingBySourceSiteHour } from '@rfcx-bio/common/dao/types'

export const createRecordings = async (sequelize: Sequelize, recordingSummaries: RecordingBySourceSiteHour[]): Promise<void> => {
  const model = ModelRepository.getInstance(sequelize).RecordingBySourceSiteHour
  await model.bulkCreate(recordingSummaries)
}
