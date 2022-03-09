import { ConnectionOptions, createConnection } from 'mysql2/promise'

export const mysqlSelect = async <T>(config: ConnectionOptions, sql: string, values: any): Promise<T[]> => {
  const connection = await createConnection(config)
  const [rows] = await connection.query(sql, values)
  void connection.end()

  return rows as T[]
}
