import { dirname } from 'path'
import { resolve } from 'path/posix'
import { Options, QueryInterface, Sequelize } from 'sequelize'
import { RunnableMigration, SequelizeStorage, Umzug } from 'umzug'

import { env } from '../../_services/env'

// Paths & resolve
const cwd = dirname(new URL(import.meta.url).pathname)
const pathToMigrations = '../migrations'

const importMigration = async (path?: string): Promise<Pick<RunnableMigration<QueryInterface>, 'up' | 'down'>> =>
  (await import(`file:///${(path ?? '').replace(/\\/g, '/')}`))

export const getSequelize = (verbose = false): Sequelize => {
  // Setup sequelize (ORM)
  const sequelizeOptions: Options = {
    host: env.BIO_DB_HOSTNAME,
    port: Number(env.BIO_DB_PORT),
    dialect: 'postgres',
    dialectOptions: {
      ssl: env.BIO_DB_SSL_ENABLED === 'true' // TODO ??? - Write `env.reqBool(...)`
        ? {
            require: true,
            rejectUnauthorized: false // https://github.com/brianc/node-postgres/issues/2009
          }
        : false
    },
    define: {
      underscored: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true
    },
    logging: verbose,
    schema: 'sequelize'
  }

  return new Sequelize(
    env.BIO_DB_DBNAME,
    env.BIO_DB_USER,
    env.BIO_DB_PASSWORD,
    sequelizeOptions
  )
}

export const getUmzug = (sequelize: Sequelize, verbose = false): Umzug<QueryInterface> => {
    return new Umzug({
      migrations: {
        glob: ['./!(*.d).{js,mjs,ts}', { cwd: resolve(cwd, pathToMigrations) }],
        resolve: params => ({
          name: params.name,
          path: params.path,
          up: async upParams => await importMigration(params.path).then(async m => await m.up(upParams)),
          down: async downParams => await importMigration(params.path).then(async m => await m.down?.(downParams))
        })
      },
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize }),
      logger: verbose ? console : undefined
    })
}
