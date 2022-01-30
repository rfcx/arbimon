import { getSequelize, getUmzug } from './connections'

const verbose = process.argv.some(arg => arg === '--verbose')

const main = async (): Promise<void> => {
  const sequelize = getSequelize(verbose)
  const umzug = getUmzug(sequelize, verbose)

  // Run migrations
  await umzug.up().then(res => {
    console.info(`Executed ${res.length} needed migrations`)
    res.forEach(r => console.info(`- ${r.name}`))
  })
  await sequelize.close()
}

await main()
  .catch(e => console.error(e))
