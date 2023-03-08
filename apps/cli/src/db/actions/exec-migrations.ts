import { type Sequelize } from 'sequelize'

import { getUmzug } from '@/db/connections'

export const execMigrations = async (sequelize: Sequelize, verbose = false): Promise<void> => {
  const umzug = getUmzug(sequelize, verbose)

  // Run migrations
  const previouslyExecuted = await umzug.executed().then(ems => ems.length)
  await umzug.up().then(res => {
    console.info(`Executed ${res.length} needed migrations (${previouslyExecuted} previously executed)`)
    res.forEach(r => { console.info(`- ${r.name}`) })
  })
}
