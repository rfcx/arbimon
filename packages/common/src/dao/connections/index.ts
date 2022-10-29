import pg from 'pg'
import { Options, Sequelize } from 'sequelize'

/**
 * PG return bigint value which will convert to string of number (Not pure number type)
 * To return number: https://github.com/sequelize/sequelize/issues/2383
 * Or by adding cast to the sql query e.g. COUNT(blah blah)::integer
 * pg.defaults.parseInt8 = true // should make the whole db bigint query effect to integer number type
 */

interface BioDbOptions {
  host: string
  port: number
  databaseName: string
  user: string
  password: string
  isSsl: boolean
  verbose: boolean
}

export const getSequelizeBase = ({ host, port, databaseName, user, password, isSsl, verbose }: BioDbOptions): Sequelize => {
  // Setup sequelize (ORM)
  const sequelizeOptions: Options = {
    host,
    port,
    dialect: 'postgres',
    dialectModule: pg,
    dialectOptions: {
      ssl: isSsl
        ? {
            require: true,
            rejectUnauthorized: false // https://github.com/brianc/node-postgres/issues/2009
          }
        : false
    },
    define: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      underscored: true
    },
    logging: verbose ? console.info : false
  }

  return new Sequelize(
    databaseName,
    user,
    password,
    sequelizeOptions
  )
}
