import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { RecordingBySiteHourModel } from '@rfcx-bio/node-common/dao/models/recording-by-site-hour-model'
import { literalizeCountsByMinute } from '@rfcx-bio/node-common/dao/query-helpers/sequelize-literal-integer-array-2d'

import { rawRecordingBySiteHour } from '../_data/integration/raw-recordings'

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  await RecordingBySiteHourModel(sequelize)
    .bulkCreate(rawRecordingBySiteHour.map(r => literalizeCountsByMinute(r, sequelize)))
}
