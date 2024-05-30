// !WARNING: MANUAL ACTION REQUIRED!

// You must keep these file in sync:
// - `tools/deployment/api/production/config.yaml` -- CONFIG ONLY
// - `tools/deployment/api/staging/config.yaml` -- CONFIG ONLY
// - `tools/deployment/api/testing/config.yaml` -- CONFIG ONLY
// - `apps/api/.env.example` -- CONFIG & SECRETS
// - `apps/api/src/_services/env/keys.ts` -- CONFIG & SECRETS

// CANNOT be undefined or an empty string
export const envKeysRequired = [
  // Secrets
  'AUTHO_ANONYMOUS_CLIENT_SECRET',
  'AWS_S3_ACCESS_KEY_ID',
  'AWS_S3_SECRET_ACCESS_KEY',
  'BIO_DB_DBNAME',
  'BIO_DB_HOSTNAME',
  'BIO_DB_PASSWORD',
  'BIO_DB_PORT',
  'BIO_DB_SSL_ENABLED',
  'BIO_DB_USER',
  'OPENSEARCH_HOST',

  // Config
  'AWS_S3_BUCKET_NAME',
  'AWS_S3_BUCKET_REGION',
  'CORE_API_BASE_URL',
  'ARBIMON_LEGACY_API_BASE_URL'
] as const

// CAN be undefined or empty string
export const envKeysOptional = [
  'AWS_OSS_ACCESS_KEY_ID',
  'AWS_OSS_SECRET_ACCESS_KEY',
  'AWS_OSS_REGION',
  'AWS_S3_ENDPOINT',
  'FASTIFY_PORT',
  'FASTIFY_ADDRESS',
  'GOOGLE_SPREADSHEET_API_KEY',
  'NODE_ENV',
  'OPENSEARCH_ENABLED',
  'OPENSEARCH_HTTPAUTH_USER',
  'OPENSEARCH_HTTPAUTH_PASSWORD',
  'OPENSEARCH_PORT',
  'OPENSEARCH_SSL_ENABLED',
  'SUPER_USER_EMAILS',
  'BACKUP_TIMEFRAME_LIMIT',
  'KUBERNETES_NAMESPACE'
] as const
