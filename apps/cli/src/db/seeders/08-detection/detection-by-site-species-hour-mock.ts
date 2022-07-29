import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { DetectionBySiteSpeciesHourModel } from '@rfcx-bio/common/dao/models/detection-by-site-species-hour-model'

import { rawDetectionBySiteSpeciesHour } from '../_data/detection-by-site-species-hour'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await DetectionBySiteSpeciesHourModel(params.context.sequelize)
    .bulkCreate(rawDetectionBySiteSpeciesHour)
}
