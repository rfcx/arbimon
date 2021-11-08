import * as mysql from 'mysql'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import { dirname, resolve } from 'path'

dotenv.config()

const __dirname = dirname(new URL(import.meta.url).pathname)
const sqlFilePath = resolve(__dirname, './species-richness.sql')
const outputFilePath = resolve(__dirname, './raw-species-richness-data-01-07-apr-2021.json')

const config = { 
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  database: process.env.DATABASE,
  timezone: 'UTC'
}

const connection = mysql.createConnection(config)
connection.connect()

// Getting validation data
const speciesRichnessSQLQuery = fs.readFileSync(sqlFilePath).toString()
connection.query(speciesRichnessSQLQuery, (error, results, _fields) => {
  if (error) throw error
  const json = JSON.stringify(results, null, 2)
  fs.writeFileSync(outputFilePath, json, 'utf8')
})

connection.end()
