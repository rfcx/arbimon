import { dirname } from 'path'
import { resolve } from 'path/posix'
import { Options, QueryInterface, Sequelize } from 'sequelize'
import { RunnableMigration, SequelizeStorage, Umzug } from 'umzug'
import { fileURLToPath } from 'url'

import { requireEnv } from '~/env'

// Paths & resolve
const currentDir = dirname(fileURLToPath(import.meta.url))
const migrationsDir = resolve(currentDir, '../../db/migrations')

// TODO: This should be injected by the script controller
const { BIO_DB_HOSTNAME, BIO_DB_PORT, BIO_DB_SSL_ENABLED, BIO_DB_DBNAME, BIO_DB_USER, BIO_DB_PASSWORD } =
  requireEnv('BIO_DB_HOSTNAME', 'BIO_DB_PORT', 'BIO_DB_SSL_ENABLED', 'BIO_DB_DBNAME', 'BIO_DB_USER', 'BIO_DB_PASSWORD')

const importMigration = async (path?: string): Promise<Pick<RunnableMigration<QueryInterface>, 'up' | 'down'>> =>
  (await import(`file:///${(path ?? '').replace(/\\/g, '/')}`))

export const getSequelize = (verbose = false): Sequelize => {
  // Setup sequelize (ORM)
  const sequelizeOptions: Options = {
    host: BIO_DB_HOSTNAME,
    port: BIO_DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: BIO_DB_SSL_ENABLED
        ? {
            require: true,
            rejectUnauthorized: false // https://github.com/brianc/node-postgres/issues/2009
          }
        : false
    },
    define: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      underscored: true
    },
    logging: verbose
  }

  return new Sequelize(
    BIO_DB_DBNAME,
    BIO_DB_USER,
    BIO_DB_PASSWORD,
    sequelizeOptions
  )
}

export const getUmzug = (sequelize: Sequelize, verbose = false, cwd = migrationsDir, filename?: string): Umzug<QueryInterface> =>
  new Umzug({
    migrations: {
      glob: [
        filename ? `./${filename}.{js,mjs,ts}` : './!(*.d).{js,mjs,ts}',
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
    storage: new SequelizeStorage({ sequelize, schema: 'sequelize', tableName: cwd === migrationsDir ? 'migrations' : 'seeders' }),
    logger: verbose ? console : undefined
  })
