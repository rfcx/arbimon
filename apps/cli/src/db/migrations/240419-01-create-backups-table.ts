import {
 type QueryInterface
  // DataTypes
} from 'sequelize'
import { type MigrationFn } from 'umzug'

// import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'
// import { setTimestampDefaults, TIMESTAMP_COLUMNS } from './_helpers/timestamps'

const TABLE_NAME = 'backup'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // TODO
}

export const down: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.dropTable(TABLE_NAME)
}
