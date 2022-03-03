import pg from 'pg'
import { Options, Sequelize } from 'sequelize'

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
    logging: verbose
  }

  return new Sequelize(
    databaseName,
    user,
    password,
    sequelizeOptions
  )
}
