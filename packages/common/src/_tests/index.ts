import { Sequelize } from 'sequelize'

import { getSequelizeBase } from '@/dao/connections'

export const getSequelizeForTests = (logging: false | ((sql: string, timing?: number) => void) = false): Sequelize =>
  getSequelizeBase({
    databaseName: 'postgres',
    host: 'localhost',
    password: 'test',
    port: 5434, // integration test db port
    isSsl: false,
    user: 'postgres',
    logging
  })
