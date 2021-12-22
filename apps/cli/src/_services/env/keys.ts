/**
 * !WARNING: MANUAL ACTION REQUIRED!
 *
 * You must keep these file in sync:
 * - `tools/deployment/api/production/config.yaml` -- CONFIG ONLY
 * - `tools/deployment/api/staging/config.yaml` -- CONFIG ONLY
 * - `tools/deployment/api/testing/config.yaml` -- CONFIG ONLY
 * - `tools/deployment/api/secrets.example.yaml` -- SECRETS ONLY
 * - `apps/api/.env.example` -- BOTH
 * - `apps/api/src/_services/env/keys.ts` -- BOTH
 */

// CANNOT be undefined or an empty string
export const envKeysRequired = <const>[
  'USERNAME', // TODO: More precise name
  'PASSWORD', // TODO: More precise name
  'DATABASE', // TODO: More precise name
  'HOST', // TODO: More precise name

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
