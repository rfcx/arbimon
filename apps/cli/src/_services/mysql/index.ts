import { type ConnectionOptions, createConnection } from 'mysql2/promise'

export const mysqlSelect = async <T>(config: ConnectionOptions, sql: string, values: any | null = null): Promise<T[]> => {
  const connection = await createConnection(config)
  // TODO: fix this - values only work with 1 length array for now [156]
  const [rows] = await connection.query(sql, values)
  void connection.end()

  return rows as T[]
}
