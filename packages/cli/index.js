const mysql = require('mysql')
const fs = require('fs')

require('dotenv').config()

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
connection.query(speciesRichnessSQLQuery, function (error, results, fields) {
  if (error) throw error
  const json = JSON.stringify(results, null, 2)
  fs.writeFileSync('raw-species-richness-data-01-07-apr-2021.json', json, 'utf8')
})

connection.end()
