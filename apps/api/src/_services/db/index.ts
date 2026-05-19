import { type Sequelize } from 'sequelize'

import { getSequelizeBase } from '@rfcx-bio/node-common/dao/connections'

import { env } from '../env'

let sequelizeInstance: Sequelize | undefined
let verboseSequelizeInstance: Sequelize | undefined

const {
  BIO_DB_HOSTNAME: host,
  BIO_DB_PORT: port,
  BIO_DB_SSL_ENABLED: isSsl,
  BIO_DB_DBNAME: databaseName,
  BIO_DB_USER: user,
  BIO_DB_PASSWORD: password
} = env

const createSequelize = (verbose: boolean): Sequelize =>
  getSequelizeBase({
    host,
    port: Number(port),
    databaseName,
    user,
    password,
    isSsl: isSsl === 'true',
    verbose
  })

export const getSequelize = (verbose = false): Sequelize => {
  if (verbose) {
    verboseSequelizeInstance = verboseSequelizeInstance ?? createSequelize(true)
    return verboseSequelizeInstance
  }

  sequelizeInstance = sequelizeInstance ?? createSequelize(false)
  return sequelizeInstance
}

export const authenticateDatabase = async (): Promise<boolean> => {
  const sequelize = getSequelize()

  try {
    await sequelize.authenticate()
    return true
  } catch (e) {
    return false
  }
}
