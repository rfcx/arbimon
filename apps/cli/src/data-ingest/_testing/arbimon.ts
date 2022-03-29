import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import { Sequelize } from 'sequelize'

function readAllFiles (folder: string, extension: string): string[] {
  const files = readdirSync(folder).filter(file => file.endsWith(`.${extension}`))
  return files.map(file => readFileSync(path.join(folder, file)).toString())
}

async function sequentialQueryAll (sqlFolder: string, sequelize: Sequelize): Promise<void> {
  const sqlFiles = readAllFiles(sqlFolder, 'sql')
  for (const sql of sqlFiles) {
    try {
      await sequelize.query(sql)
    } catch (err) {
      console.error('Failed running SQL:\n' + sql)
      throw err
    }
  }
}

export const getPopulatedArbimonInMemorySequelize = async (): Promise<Sequelize> => {
  const testingFolder = path.join(__dirname, '../../../src/data-ingest/_testing') // TODO Find a better way of getting the path
  const ddlFolder = path.join(testingFolder, 'arbimon-ddl')
  const seedsFolder = path.join(testingFolder, 'arbimon-seeds')

  const sequelize = new Sequelize('sqlite::memory:', { logging: false })
  await sequentialQueryAll(ddlFolder, sequelize)
  await sequentialQueryAll(seedsFolder, sequelize)
  return sequelize
}
