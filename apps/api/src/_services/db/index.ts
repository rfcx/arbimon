import { Sequelize } from 'sequelize'

import { getSequelizeBase } from '@rfcx-bio/common/dao/connections'

import { env } from '../env'

const {
  BIO_DB_HOSTNAME: host,
  BIO_DB_PORT: port,
  BIO_DB_SSL_ENABLED: isSsl,
  BIO_DB_DBNAME: databaseName,
  BIO_DB_USER: user,
  BIO_DB_PASSWORD: password
} = env

export const getSequelize = (logging: false | ((sql: string, timing?: number) => void) = false): Sequelize =>
  getSequelizeBase({
    host,
    port: Number(port),
    databaseName,
    user,
    password,
    isSsl: isSsl === 'true',
    logging
  })
