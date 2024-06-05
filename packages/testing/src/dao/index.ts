import * as dotenv from 'dotenv'

import { getSequelizeBase } from '@rfcx-bio/node-common/dao/connections'
import { type AllModels, ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'

dotenv.config()

interface Env {
  BIO_DB_HOSTNAME: string
  BIO_DB_PORT: string
  BIO_DB_SSL_ENABLED: string
  BIO_DB_DBNAME: string
  BIO_DB_USER: string
  BIO_DB_PASSWORD: string
}

const env = process.env as unknown as Env

const elevatedUser = env.BIO_DB_USER.replace('_api', '_cli')

const elevatedSequelize =
  getSequelizeBase({
    host: env.BIO_DB_HOSTNAME,
    port: Number(env.BIO_DB_PORT),
    databaseName: env.BIO_DB_DBNAME,
    user: elevatedUser,
    password: env.BIO_DB_PASSWORD,
    isSsl: env.BIO_DB_SSL_ENABLED === 'true',
    verbose: false
  })

export const modelRepositoryWithElevatedPermissions: AllModels =
  (new ModelRepository(elevatedSequelize)).repo
