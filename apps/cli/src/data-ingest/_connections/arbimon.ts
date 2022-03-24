import { ConnectionOptions } from 'mysql2/promise'
import { Options, Sequelize } from 'sequelize'

import { requireEnv } from '~/env'

// TODO: This should be injected by the script controller
const { ARBIMON_DB_USER, ARBIMON_DB_PASSWORD, ARBIMON_DB_HOSTNAME, ARBIMON_DB_DBNAME } =
  requireEnv('ARBIMON_DB_USER', 'ARBIMON_DB_PASSWORD', 'ARBIMON_DB_HOSTNAME', 'ARBIMON_DB_DBNAME')

// TODO: remove Arbimon config and use Sequelize instead
export const ARBIMON_CONFIG: ConnectionOptions = {
  user: ARBIMON_DB_USER,
  password: ARBIMON_DB_PASSWORD,
  host: ARBIMON_DB_HOSTNAME,
  database: ARBIMON_DB_DBNAME,
  timezone: '+00:00'
}

interface ArbimonConnectionOptions {
  user: string
  password: string
  host: string
  database: string
  timezone: string
}

export const getArbimonSequelize = (co: ArbimonConnectionOptions): Sequelize => {
  // Setup sequelize (ORM)
  const sequelizeOptions: Options = {
    host: co.host,
    dialect: 'mysql',
    define: {
      charset: 'utf8',
      collate: 'utf8_general_ci'
    },
    logging: true
  }

  return new Sequelize(
    co.database,
    co.user,
    co.password,
    sequelizeOptions
  )
}
