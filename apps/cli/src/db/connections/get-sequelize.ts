import { Sequelize } from 'sequelize'

import { getSequelizeBase } from '@rfcx-bio/common/dao/connections'

import { requireEnv } from '~/env'

// TODO: This should be injected by the script controller
const { BIO_DB_HOSTNAME: host, BIO_DB_PORT: port, BIO_DB_SSL_ENABLED: isSsl, BIO_DB_DBNAME: databaseName, BIO_DB_USER: user, BIO_DB_PASSWORD: password } =
  requireEnv('BIO_DB_HOSTNAME', 'BIO_DB_PORT', 'BIO_DB_SSL_ENABLED', 'BIO_DB_DBNAME', 'BIO_DB_USER', 'BIO_DB_PASSWORD')

export const getSequelize = (verbose = false): Sequelize =>
  getSequelizeBase({ host, port, databaseName, user, password, isSsl, logging: verbose ? console.info : false })
