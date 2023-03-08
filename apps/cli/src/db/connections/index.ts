import { dirname, resolve } from 'path'
import { type QueryInterface, type Sequelize } from 'sequelize'
import { type RunnableMigration, SequelizeStorage, Umzug } from 'umzug'
import { fileURLToPath, pathToFileURL } from 'url'

import { getSequelizeBase } from '@rfcx-bio/common/dao/connections'

import { TABLE_SEQUELIZE_MIGRATIONS } from '@/db/connections/table-names'
import { requireEnv } from '~/env'

// Paths & resolve
const currentDir = dirname(fileURLToPath(import.meta.url))
const migrationsDir = resolve(currentDir, '../../db/migrations')

// TODO: This should be injected by the script controller
const { BIO_DB_HOSTNAME: host, BIO_DB_PORT: port, BIO_DB_SSL_ENABLED: isSsl, BIO_DB_DBNAME: databaseName, BIO_DB_USER: user, BIO_DB_PASSWORD: password } =
requireEnv('BIO_DB_HOSTNAME', 'BIO_DB_PORT', 'BIO_DB_SSL_ENABLED', 'BIO_DB_DBNAME', 'BIO_DB_USER', 'BIO_DB_PASSWORD')

export const getSequelize = (verbose = false): Sequelize =>
  getSequelizeBase({ host, port, databaseName, user, password, isSsl, verbose })

const importMigration = async (path?: string): Promise<Pick<RunnableMigration<QueryInterface>, 'up' | 'down'>> =>
    await import(pathToFileURL(path ?? '').href)

export const getUmzug = (sequelize: Sequelize, verbose = false, storageTableName: string = TABLE_SEQUELIZE_MIGRATIONS, cwd = migrationsDir, filename?: string): Umzug<QueryInterface> =>
  new Umzug({
    migrations: {
      glob: [
        filename ? `${filename}.{js,mjs,ts}` : '!(*.d).{js,mjs,ts}',
        { cwd }
      ],
      resolve: params => ({
        name: params.name,
        path: params.path,
        up: async upParams => await importMigration(params.path).then(async m => await m.up(upParams)),
        down: async downParams => await importMigration(params.path).then(async m => await m.down?.(downParams))
      })
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize, schema: 'sequelize', tableName: storageTableName }),
    logger: verbose ? console : undefined
  })
