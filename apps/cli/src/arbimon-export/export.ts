import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as mysql from 'mysql'
import { dirname, resolve } from 'path'

// Parameters
const currentDir = dirname(new URL(import.meta.url).pathname)

// Env
dotenv.config()

const config = {
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  database: process.env.DATABASE,
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
  resolve(currentDir, './raw-species-call.json')
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
