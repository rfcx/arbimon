// mysql2pg Phase 5.2 dry-run diff: run each extractor against live MariaDB
// (authoritative) AND the live PG copy with identical params; deep-compare.
// READ-ONLY: uses the arbimon RO lanes; no writes anywhere.
// Usage: node twin-diff.mjs   (env: MY_HOST/MY_PORT/MY_USER/MY_PASS/MY_DB, PG_HOST/PG_PORT/PG_USER/PG_PASS/PG_DB, SYNC_UNTIL, BATCH)
import pg from 'pg'
import { Sequelize } from 'sequelize'

process.env.ARBIMON_DB_USER ??= 'x'; process.env.ARBIMON_DB_PASSWORD ??= 'x'
process.env.ARBIMON_DB_HOSTNAME ??= 'x'; process.env.ARBIMON_DB_DBNAME ??= 'x'
process.env.BIO_DB_DBNAME ??= 'x'; process.env.BIO_DB_HOSTNAME ??= 'x'
process.env.BIO_DB_PASSWORD ??= 'x'; process.env.BIO_DB_PORT ??= '5432'
process.env.BIO_DB_SSL_ENABLED ??= 'false'; process.env.BIO_DB_USER ??= 'x'

const { getArbimonProjects } = await import('./lib/ingest/inputs/get-arbimon-project.js')
const { getArbimonSpecies } = await import('./lib/ingest/inputs/get-arbimon-species.js')
const { getArbimonSites } = await import('./lib/ingest/inputs/get-arbimon-site.js')
const { getArbimonSpeciesCalls } = await import('./lib/ingest/inputs/get-arbimon-species-call.js')
const { getArbimonRecording, getArbimonRecordingDeleted, getArbimonProjectRecordingsBySiteHour } = await import('./lib/ingest/inputs/get-arbimon-recording.js')
const { getArbimonDetections, getArbimonProjectDetectionBySiteSpeciesHours } = await import('./lib/ingest/inputs/get-arbimon-detection.js')

const mysql = new Sequelize(process.env.MY_DB, process.env.MY_USER, process.env.MY_PASS, {
  host: process.env.MY_HOST, port: Number(process.env.MY_PORT ?? 3306), dialect: 'mysql',
  define: { charset: 'utf8', collate: 'utf8_general_ci' }, logging: false
})
const pgsql = new Sequelize(process.env.PG_DB, process.env.PG_USER, process.env.PG_PASS, {
  host: process.env.PG_HOST, port: Number(process.env.PG_PORT ?? 5432), dialect: 'postgres',
  dialectModule: pg, logging: false
})
// same per-connection parsers the ported arbimon.ts applies
const om = pgsql.connectionManager.oidParserMap
om.set(20, v => parseInt(v, 10))
om.set(1114, v => v)

const syncUntilDate = new Date(process.env.SYNC_UNTIL ?? '2026-07-01T00:00:00Z')
const params = { syncUntilDate, syncUntilId: '0', syncBatchLimit: Number(process.env.BATCH ?? 500) }

// normalize engine-representation deltas that the CONSUMERS also normalize:
//  - datetime strings: mysql path emits ISO via .toISOString(); pg path emits
//    'YYYY-MM-DD HH:MM:SS[.f]' — normalize both to epoch-ms for compare
//  - numbers: mysql DECIMAL/DOUBLE may come back number, pg numeric → string;
//    normalize numeric strings
const norm = v => {
  if (v instanceof Date) return v.getTime()
  if (typeof v === 'string') {
    if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/.test(v)) return new Date(v.includes('T') ? v : v.replace(' ', 'T') + 'Z').getTime()
    if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v)
  }
  // float32 columns (recordings.duration REAL, etc.): mysql widens f32→f64 with
  // representation residue (59.977001), pg parses the text form (59.977) — the
  // stored 32-bit value is identical; compare at f32 precision
  if (typeof v === 'number') return Number.isInteger(v) ? v : Math.fround(v)
  return v
}
// countsByMinute is an object built from GROUP_CONCAT/string_agg output whose
// concat ORDER is unspecified in both engines — compare with sorted keys
const normVal = v => (v !== null && typeof v === 'object' && !(v instanceof Date))
  ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, normVal(x)]))
  : norm(v)
const normRow = r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, normVal(v)]))
const normRows = rows => rows.map(normRow)

const diff = (name, a, b) => {
  const A = normRows(a); const B = normRows(b)
  let bad = 0
  if (A.length !== B.length) { console.log(`✗ ${name}: row count ${A.length} vs ${B.length}`); bad++ }
  const n = Math.min(A.length, B.length)
  for (let i = 0; i < n && bad < 6; i++) {
    const ka = JSON.stringify(A[i]); const kb = JSON.stringify(B[i])
    if (ka !== kb) { console.log(`✗ ${name}[${i}]:\n  mysql: ${ka}\n  pg:    ${kb}`); bad++ }
  }
  if (!bad) console.log(`✓ ${name}: ${A.length} rows identical`)
  return bad
}

let total = 0
const run = async (name, fn, ...args) => {
  try {
    const [a, b] = await Promise.all([fn(mysql, ...args), fn(pgsql, ...args)])
    total += diff(name, a, b)
  } catch (e) { console.log(`✗ ${name}: ERROR ${e.message}`); total++ }
}

await run('projects', getArbimonProjects, params)
await run('species', getArbimonSpecies, params)
await run('sites', getArbimonSites, params)
await run('species-calls', getArbimonSpeciesCalls, params)
await run('recordings', getArbimonRecording, params)
await run('recordings-deleted', getArbimonRecordingDeleted, params)
await run('detections', getArbimonDetections, params)

// project-scoped aggregation extractors (the 3 ported dialect expressions)
const PROJECT_ID = Number(process.env.PROJECT_ID ?? 0)
if (PROJECT_ID) {
  await run('proj-recordings-by-site-hour', getArbimonProjectRecordingsBySiteHour, PROJECT_ID, { syncUntilDate, syncUntilId: '0' }, 500, 0)
  await run('proj-detections-by-site-species-hour', getArbimonProjectDetectionBySiteSpeciesHours, PROJECT_ID, { syncUntilDate, syncUntilId: '0' }, 500, 0)
}

await mysql.close(); await pgsql.close()
console.log(total === 0 ? 'TWIN-DIFF CLEAN' : `TWIN-DIFF: ${total} divergences`)
process.exit(total === 0 ? 0 : 1)