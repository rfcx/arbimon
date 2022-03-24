import { readFileSync, readdirSync } from 'fs'
import { Sequelize } from 'sequelize'
import path from 'path'

function readAllFiles(folder: string, extension: string): string[] {
  const files = readdirSync(folder).filter(file => file.endsWith(`.${extension}`))
  return files.map(file => readFileSync(path.join(folder, file)).toString())
}

async function queryAll(sqlFolder: string, sequelize: Sequelize) {
  const sqlFiles = readAllFiles(sqlFolder, 'sql')
  for (const sql of sqlFiles) {
    console.log('Running...\n' + sql)
    await sequelize.query(sql)
  }
}

export const getPopulatedArbimonInMemorySequelize = async (): Promise<Sequelize> => {
  const testingFolder = path.join(__dirname, '../../../src/data-ingest/_testing')
  const ddlFolder = path.join(testingFolder, 'arbimon-ddl')
  const seedsFolder = path.join(testingFolder, 'arbimon-seeds')
  
  const sequelize = new Sequelize('sqlite::memory:')
  await queryAll(ddlFolder, sequelize)
  await queryAll(seedsFolder, sequelize)
  return sequelize
}
