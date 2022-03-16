import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { incrementalSync } from '@/sync/all'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await incrementalSync(params.context.sequelize)
}
