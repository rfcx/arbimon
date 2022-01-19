/**
 * !WARNING: MANUAL ACTION REQUIRED!
 *
 * You must keep these file in sync:
 * - `tools/deployment/cli/production/config.yaml` -- CONFIG ONLY
 * - `tools/deployment/cli/staging/config.yaml` -- CONFIG ONLY
 * - `tools/deployment/cli/testing/config.yaml` -- CONFIG ONLY
 * - `apps/cli/.env.example` -- CONFIG & SECRETS
 * - `apps/cli/src/_services/env/keys.ts` -- CONFIG & SECRETS
 */

// CANNOT be undefined or an empty string
export const envKeysRequired = <const>[
  'ARBIMON_DB_DBNAME',
  'ARBIMON_DB_HOSTNAME',
  'ARBIMON_DB_PASSWORD',
  'ARBIMON_DB_USER',

  'BIO_DB_DBNAME',
  'BIO_DB_HOSTNAME',
  'BIO_DB_PASSWORD',
  'BIO_DB_PORT',
  'BIO_DB_SSL_ENABLED',
  'BIO_DB_USER',

  'IUCN_BASE_URL',
  'IUCN_TOKEN',

  'WIKI_BASE_URL'
]

// CAN be undefined or empty string
export const envKeysOptional = <const>[]
