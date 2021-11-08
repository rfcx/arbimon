import * as mysql from 'mysql'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import { dirname, resolve } from 'path'

// Parameters
const __dirname = dirname(new URL(import.meta.url).pathname)
const sqlFilePath = resolve(__dirname, './get-detection-summaries.sql')
const outputFilePath = resolve(__dirname, './raw-summaries.json')

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

const speciesRichnessSQLQuery = fs.readFileSync(sqlFilePath).toString()
connection.query(speciesRichnessSQLQuery, (error, results, _fields) => {
  if (error) throw error
  const json = JSON.stringify(results, null, 2)
  fs.writeFileSync(outputFilePath, json, 'utf8')
  connection.end()
})
