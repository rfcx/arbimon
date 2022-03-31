import { Sequelize } from 'sequelize'

import { getSequelizeBase } from '@/dao/connections'

export const getSequelizeForTests = (verbose = true): Sequelize =>
  getSequelizeBase({
    databaseName: 'postgres',
    host: 'localhost',
    password: 'test',
    port: 5432,
    isSsl: false,
    user: 'postgres',
    verbose
  })
