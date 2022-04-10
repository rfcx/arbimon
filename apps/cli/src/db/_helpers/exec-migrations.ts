import { Sequelize } from 'sequelize'

import { getUmzug } from '../connections'

export const execMigrations = async (sequelize: Sequelize, verbose = false): Promise<void> => {
  const umzug = getUmzug(sequelize, verbose)

  // Run migrations
  console.info('Migrating:')
  const previouslyExecuted = await umzug.executed().then(ems => ems.length)
  await umzug.up().then(res => {
    console.info(`(executed ${res.length} needed migrations; ${previouslyExecuted} previously executed)`)
    res.forEach(r => console.info(`- ${r.name}`))
  })
}
