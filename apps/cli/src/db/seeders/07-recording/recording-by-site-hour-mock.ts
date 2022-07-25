import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { RecordingBySiteHourModel } from '@rfcx-bio/common/dao/models/recording-by-site-hour'

import { rawRecordingBySiteHour } from '../_data/recording-by-site-hour'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await RecordingBySiteHourModel(params.context.sequelize)
    .bulkCreate(rawRecordingBySiteHour)
}
