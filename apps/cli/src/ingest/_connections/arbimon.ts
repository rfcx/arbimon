import { type Options, Sequelize } from 'sequelize'

import { requireEnv } from '~/env'

// TODO: This should be injected by the script controller
const { ARBIMON_DB_USER, ARBIMON_DB_PASSWORD, ARBIMON_DB_HOSTNAME, ARBIMON_DB_DBNAME } =
  requireEnv('ARBIMON_DB_USER', 'ARBIMON_DB_PASSWORD', 'ARBIMON_DB_HOSTNAME', 'ARBIMON_DB_DBNAME')

interface ArbimonConnectionOptions {
  user: string
  password: string
  host: string
  database: string
}

const ARBIMON_CONFIG: ArbimonConnectionOptions = {
  user: ARBIMON_DB_USER,
  password: ARBIMON_DB_PASSWORD,
  host: ARBIMON_DB_HOSTNAME,
  database: ARBIMON_DB_DBNAME
}

const getArbimonSequelizeBase = ({ user, password, host, database }: ArbimonConnectionOptions): Sequelize => {
  const sequelizeOptions: Options = {
    host,
    dialect: 'mysql',
    define: {
      charset: 'utf8',
      collate: 'utf8_general_ci'
    },
    logging: false
  }

  return new Sequelize(
    database,
    user,
    password,
    sequelizeOptions
  )
}

export const getArbimonSequelize = (): Sequelize => getArbimonSequelizeBase(ARBIMON_CONFIG)
