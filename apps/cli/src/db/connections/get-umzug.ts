import { dirname, resolve } from 'path'
import { QueryInterface, Sequelize } from 'sequelize'
import { RunnableMigration, SequelizeStorage, Umzug } from 'umzug'
import { fileURLToPath, pathToFileURL } from 'url'

import { TABLE_SEQUELIZE_MIGRATIONS } from './table-names'

// Paths & resolve
const currentDir = dirname(fileURLToPath(import.meta.url))
const pathToMigrations = '../migrations'
const migrationsDir = resolve(currentDir, pathToMigrations)

const importMigration = async (path?: string): Promise<Pick<RunnableMigration<QueryInterface>, 'up' | 'down'>> =>
    await import(pathToFileURL(path ?? '').href)

export const getUmzug = (sequelize: Sequelize, verbose = false, storageTableName: string = TABLE_SEQUELIZE_MIGRATIONS, cwd = migrationsDir, filename?: string): Umzug<QueryInterface> =>
  new Umzug({
    migrations: {
      glob: [
        filename ? `${filename}.{js,mjs,ts}` : '**/!(*.d).{js,mjs,ts}',
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
