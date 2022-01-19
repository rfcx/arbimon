// !WARNING: MANUAL ACTION REQUIRED!

// You must keep these file in sync:
// - `tools/deployment/api/production/config.yaml` -- CONFIG ONLY
// - `tools/deployment/api/staging/config.yaml` -- CONFIG ONLY
// - `tools/deployment/api/testing/config.yaml` -- CONFIG ONLY
// - `apps/api/.env.example` -- CONFIG & SECRETS
// - `apps/api/src/_services/env/keys.ts` -- CONFIG & SECRETS

// CANNOT be undefined or an empty string
export const envKeysRequired = <const>[
  'PUERTO_RICO_PROJECT_SLUG'
]

// CAN be undefined or empty string
export const envKeysOptional = <const>[
  // TODO - Move to required after db is live
  'BIO_DB_DBNAME',
  'BIO_DB_HOSTNAME',
  'BIO_DB_PASSWORD',
  'BIO_DB_PORT',
  'BIO_DB_SSL_ENABLED',
  'BIO_DB_USER',

  'NODE_ENV',
  'FASTIFY_PORT',
  'FASTIFY_ADDRESS'
]
