import * as mysql from 'mysql'

import { env } from '../env'

export const queryArbimon = async <T>(sql: string): Promise<T[]> => {
  // Env
  const config = {
    user: env.ARBIMON_DB_USER,
    password: env.ARBIMON_DB_PASSWORD,
    host: env.ARBIMON_DB_HOSTNAME,
    database: env.ARBIMON_DB_DBNAME,
    timezone: 'UTC'
  }

  // Query
  const connection = mysql.createConnection(config)
  connection.connect()

  return await query<T>(connection, sql)
    .finally(connection.end)
}

async function query <T> (connection: mysql.Connection, queryString: string): Promise<T[]> {
  return await new Promise((resolve, reject) => {
    connection.query(queryString, (error, results, _fields) => {
      if (error) reject(error)
      resolve(results as T[])
    })
  })
}
