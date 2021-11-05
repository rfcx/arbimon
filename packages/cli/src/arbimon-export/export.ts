import * as mysql from 'mysql'
import * as fs from 'fs'
import * as dotenv from 'dotenv'

dotenv.config()

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
const speciesRichnessSQLQuery = fs.readFileSync('species-richness.sql').toString()
connection.query(speciesRichnessSQLQuery, (error, results, _fields) => {
  if (error) throw error
  const json = JSON.stringify(results, null, 2)
  fs.writeFileSync('raw-species-richness-data-01-07-apr-2021.json', json, 'utf8')
})

connection.end()
