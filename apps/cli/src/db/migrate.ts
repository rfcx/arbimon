import { getSequelize, getUmzug } from './connections'

const verbose = process.argv.some(arg => arg === '--verbose')

const main = async (): Promise<void> => {
  const sequelize = getSequelize(verbose)
  const umzug = getUmzug(sequelize, verbose)

  // Run migrations
  const previouslyExecuted = await umzug.executed().then(ems => ems.length)
  await umzug.up().then(res => {
    console.info(`Executed ${res.length} needed migrations (${previouslyExecuted} previously executed)`)
    res.forEach(r => console.info(`- ${r.name}`))
  })
  await sequelize.close()
}

await main()
  .catch(e => console.error(e))
