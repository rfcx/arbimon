import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { RecordingBySiteHourModel } from '@rfcx-bio/common/dao/models/recording-by-site-hour-model'

import { rawRecordingBySiteHour } from '../_data/integration/raw-recordings'
import { literalizeCountsByMinute } from '../_helpers/sequelize-literal-integer-array-2d'

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  await RecordingBySiteHourModel(sequelize)
    .bulkCreate(rawRecordingBySiteHour.map(r => literalizeCountsByMinute(r, sequelize)))
}
