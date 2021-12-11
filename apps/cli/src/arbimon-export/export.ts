import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as mysql from 'mysql'
import { dirname, resolve } from 'path'

import { env } from '../_services/env/index.js'

// Parameters
const currentDir = dirname(new URL(import.meta.url).pathname)

// Env
dotenv.config()

const config = {
  user: env.USERNAME,
  password: env.PASSWORD,
  host: env.HOST,
  database: env.DATABASE,
  timezone: 'UTC'
}

// Query & save
const connection = mysql.createConnection(config)
connection.connect()

const exportDetection = exportQueryResultToJsonFile(connection,
  resolve(currentDir, './get-detection-summaries.sql'),
  resolve(currentDir, './raw-summaries.json')
)
const exportSpeciesCall = exportQueryResultToJsonFile(connection,
  resolve(currentDir, './get-example-of-species-call.sql'),
  resolve(currentDir, './raw-species-callw.json')
)
await Promise.all([exportDetection, exportSpeciesCall])

connection.end()

// TODO: move this to common / helper file
async function query (connection: mysql.Connection, queryString: string): Promise<unknown> {
  return await new Promise((resolve, reject) => {
    connection.query(queryString, (error, results, _fields) => {
      if (error) reject(error)
      resolve(results)
    })
  })
}

async function exportQueryResultToJsonFile (connection: mysql.Connection, sqlFilePath: string, outputFilePath: string): Promise<void> {
  const sqlQuery = fs.readFileSync(sqlFilePath).toString()
  const results = (await query(connection, sqlQuery))
  fs.writeFileSync(outputFilePath, JSON.stringify(results, null, 2), 'utf8')
}
