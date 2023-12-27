/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

const TABLE_NAME = 'cache_user_project'

export const up: MigrationFn<QueryInterface> = async (params) => { await params.context.dropTable(TABLE_NAME) }
