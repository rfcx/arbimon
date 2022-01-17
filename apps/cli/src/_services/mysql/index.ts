import { ConnectionOptions, createConnection } from 'mysql2/promise'

export const mysqlSelect = async <T>(config: ConnectionOptions, sql: string): Promise<T[]> => {
  const connection = await createConnection(config)
  const [rows] = await connection.query(sql)
  return rows as T[]
}
