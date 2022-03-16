import { ConnectionOptions } from 'mysql2/promise'

import { requireEnv } from '~/env'

// TODO: This should be injected by the script controller
const { ARBIMON_DB_USER, ARBIMON_DB_PASSWORD, ARBIMON_DB_HOSTNAME, ARBIMON_DB_DBNAME } =
  requireEnv('ARBIMON_DB_USER', 'ARBIMON_DB_PASSWORD', 'ARBIMON_DB_HOSTNAME', 'ARBIMON_DB_DBNAME')

export const ARBIMON_CONFIG: ConnectionOptions = {
  user: ARBIMON_DB_USER,
  password: ARBIMON_DB_PASSWORD,
  host: ARBIMON_DB_HOSTNAME,
  database: ARBIMON_DB_DBNAME,
  timezone: '+00:00'
}
