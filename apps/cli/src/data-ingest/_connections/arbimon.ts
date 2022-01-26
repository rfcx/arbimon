import { ConnectionOptions } from 'mysql2/promise'

import { env } from '~/env'

export const ARBIMON_CONFIG: ConnectionOptions = {
  user: env.ARBIMON_DB_USER,
  password: env.ARBIMON_DB_PASSWORD,
  host: env.ARBIMON_DB_HOSTNAME,
  database: env.ARBIMON_DB_DBNAME,
  timezone: '+00:00'
}
