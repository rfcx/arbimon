import { Sequelize } from 'sequelize'

import { getSequelizeBase } from '@/dao/connections'

export const getSequelizeForTests = (logging: false | ((sql: string, timing?: number) => void) = console.info): Sequelize =>
  getSequelizeBase({
    databaseName: 'postgres',
    host: 'localhost',
    password: 'test',
    port: 5432,
    isSsl: false,
    user: 'postgres',
    logging
  })
