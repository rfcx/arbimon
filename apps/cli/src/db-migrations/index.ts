import { dirname } from 'path'
import { Options, QueryInterface, Sequelize } from 'sequelize'
import { RunnableMigration, SequelizeStorage, Umzug } from 'umzug'

import { env } from '../_services/env'

// Inputs
const verbose = process.argv.some(arg => arg === '--verbose')

// Paths & resolve
const cwd = dirname(new URL(import.meta.url).pathname)
const importMigration = async (path?: string): Promise<Pick<RunnableMigration<QueryInterface>, 'up' | 'down'>> => (await import(`file:///${(path ?? '').replace(/\\/g, '/')}`))

const main = async (): Promise<void> => {
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
    // models: [path.join(currentDir, '../../**/*.model.*')],
  }

  const sequelize = new Sequelize(
    env.BIO_DB_DBNAME,
    env.BIO_DB_USER,
    env.BIO_DB_PASSWORD,
    sequelizeOptions
  )

  // Setup umzug (migration runner)
  const umzug = new Umzug({
    migrations: {
      glob: ['./migrations/!(*.d).{js,mjs,ts}', { cwd }],
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

  // Run migrations
  await umzug.up().then(res => {
    console.info()
    console.info(`Executed ${res.length} needed migrations`)
    res.forEach(r => console.info(`- ${r.name}`))
  })
  await sequelize.close()
}

await main()
  .catch(e => console.error(e))
