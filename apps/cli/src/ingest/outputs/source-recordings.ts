import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SourceRecordingBySyncSiteHour } from '@rfcx-bio/common/dao/types'

export const createRecordings = async (sequelize: Sequelize, recordingSummaries: SourceRecordingBySyncSiteHour[]): Promise<void> => {
  const model = ModelRepository.getInstance(sequelize).SourceRecordingBySyncSiteHour
  await model.bulkCreate(recordingSummaries)
}
