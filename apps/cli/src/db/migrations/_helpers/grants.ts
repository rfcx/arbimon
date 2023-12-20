import type { Sequelize } from 'sequelize'
import { QueryTypes } from 'sequelize'

import { requireEnv } from '~/env'

export const enum GrantPermission {
  SELECT = 'SELECT',
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

export const enum DatabaseUser {
  API = 'API'
}

const CLI_DATABASE_USER_SUFFIX = 'cli'
const { BIO_DB_USER: cliUser } = requireEnv('BIO_DB_USER')

export const grant = async (sequelize: Sequelize, tableName: string, permissions: GrantPermission[], user: DatabaseUser): Promise<void> => {
  // If the current user is not ???_cli then ignore grants (running locally)
  if (!cliUser.endsWith(CLI_DATABASE_USER_SUFFIX)) {
    return
  }
  const permissionRaw = permissions.join(', ')
  const userRaw = cliUser.replace(`_${CLI_DATABASE_USER_SUFFIX}`, `_${user}`)
  await sequelize.query(
    `GRANT ${permissionRaw} ON "${tableName}" TO ${userRaw};`,
    { type: QueryTypes.RAW }
  )
}
