import pg from 'pg'
import { type Options, Sequelize } from 'sequelize'

import { optionalEnv, requireEnv } from '~/env'

// TODO: This should be injected by the script controller
const { ARBIMON_DB_USER, ARBIMON_DB_PASSWORD, ARBIMON_DB_HOSTNAME, ARBIMON_DB_DBNAME } =
  requireEnv('ARBIMON_DB_USER', 'ARBIMON_DB_PASSWORD', 'ARBIMON_DB_HOSTNAME', 'ARBIMON_DB_DBNAME')

// mysql2pg (rfcx-local OPEN-ITEMS #40, plan §5.2): the arbimon source DB is
// migrating MariaDB→PostgreSQL. The dialect is env-driven so the same image
// can run against either engine (twin-compare during the bake, flip via
// secret). DEFAULT stays 'mysql' — behavior is unchanged unless
// ARBIMON_DB_DIALECT=postgres is set.
const { ARBIMON_DB_DIALECT, ARBIMON_DB_PORT } = optionalEnv('ARBIMON_DB_DIALECT', 'ARBIMON_DB_PORT')

interface ArbimonConnectionOptions {
  user: string
  password: string
  host: string
  database: string
  dialect: 'mysql' | 'postgres'
  port: number | undefined
}

const ARBIMON_CONFIG: ArbimonConnectionOptions = {
  user: ARBIMON_DB_USER,
  password: ARBIMON_DB_PASSWORD,
  host: ARBIMON_DB_HOSTNAME,
  database: ARBIMON_DB_DBNAME,
  dialect: ARBIMON_DB_DIALECT === 'postgres' ? 'postgres' : 'mysql',
  port: ARBIMON_DB_PORT
}

/**
 * Align node-pg raw-query type parsing with what the extractors already handle
 * (the mysql2 and sqlite paths):
 *   - int8/bigint (oid 20): node-pg returns STRING; the arbimon PG copy stores
 *     ids (recording_id, recording_validation_id, template_id, …) as bigint,
 *     while mysql2 returns numbers and the zod schemas expect z.number().
 *     Values are far below Number.MAX_SAFE_INTEGER.
 *   - timestamp without time zone (oid 1114): node-pg returns a JS Date
 *     (parsed in process-local tz); the extractors' non-mysql branch expects a
 *     STRING (this is exactly the proven sqlite test-harness path). Keeping
 *     the raw 'YYYY-MM-DD HH:MM:SS' string also avoids any tz round-trip.
 *
 * Sequelize 7.0.0-alpha.5's postgres ConnectionManager OVERRIDES
 * `connectionConfig.types` with its own oidParserMap-backed getTypeParser
 * (dialectOptions.types is silently dropped — it is not in the merge
 * pick-list), so the ONLY per-connection hook is that oidParserMap. The map
 * is checked before falling back to pg's global parsers, and this keeps the
 * bio/insights connection (node-common) untouched — do NOT use
 * pg.types.setTypeParser here, it is process-global.
 */
const applyArbimonPgTypeParsers = (sequelize: Sequelize): Sequelize => {
  const connectionManager = (sequelize as any).connectionManager
  const oidParserMap: Map<number, (v: string) => unknown> | undefined = connectionManager?.oidParserMap
  if (typeof oidParserMap?.set !== 'function') {
    // Fail loud at startup rather than silently returning strings/Dates the
    // parsers downstream would misread (sequelize internals changed on upgrade)
    throw new Error('arbimon pg connection: sequelize connectionManager.oidParserMap not found — re-verify type parsing after a sequelize upgrade')
  }
  oidParserMap.set(20, (value: string) => parseInt(value, 10)) // int8 → number
  oidParserMap.set(1114, (value: string) => value) // timestamp (no tz) → string (mirror the sqlite path)
  return sequelize
}

const getArbimonSequelizeBase = ({ user, password, host, database, dialect, port }: ArbimonConnectionOptions): Sequelize => {
  const sequelizeOptions: Options = dialect === 'postgres'
    ? {
        host,
        ...(port !== undefined ? { port } : {}),
        dialect: 'postgres',
        dialectModule: pg,
        logging: false
      }
    : {
        host,
        ...(port !== undefined ? { port } : {}),
        dialect: 'mysql',
        define: {
          charset: 'utf8',
          collate: 'utf8_general_ci'
        },
        logging: false
      }

  const sequelize = new Sequelize(
    database,
    user,
    password,
    sequelizeOptions
  )

  return dialect === 'postgres' ? applyArbimonPgTypeParsers(sequelize) : sequelize
}

export const getArbimonSequelize = (): Sequelize => getArbimonSequelizeBase(ARBIMON_CONFIG)
