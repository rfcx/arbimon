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

import { type BioEnvironment, type Protection, BIO_ENVIRONMENT_VALUES, PROTECTION_VALUES } from './types'

// Getters
type Getter<T> = (env: Record<string, string>, key: string) => T | undefined

const stringGetter: Getter<string> = (env, key): string | undefined => {
  const raw = env[key] ?? ''
  return raw.length > 0 ? raw : undefined
}

const numberGetter: Getter<number> = (env, key): number | undefined => {
  const raw = env[key] ?? ''
  return raw.length > 0 ? Number(raw) : undefined
}

const booleanGetter: Getter<boolean> = (env, key): boolean | undefined => env[key] === 'true'

const unionGetter = <T extends string> (allowed: T[]): Getter<T> => (env, key) => {
  const raw = env[key] as T
  return allowed.includes(raw) ? raw : undefined
}

// Env keys/types
export const envGetters = {
  PROTECTION: unionGetter<Protection>(Object.values(PROTECTION_VALUES)),
  BIO_ENVIRONMENT: unionGetter<BioEnvironment>(Object.values(BIO_ENVIRONMENT_VALUES)),

  ARBIMON_DB_DBNAME: stringGetter,
  ARBIMON_DB_HOSTNAME: stringGetter,
  ARBIMON_DB_PASSWORD: stringGetter,
  ARBIMON_DB_USER: stringGetter,

  AUTHO_ANONYMOUS_CLIENT_SECRET: stringGetter,

  BIO_DB_DBNAME: stringGetter,
  BIO_DB_HOSTNAME: stringGetter,
  BIO_DB_PASSWORD: stringGetter,
  BIO_DB_PORT: numberGetter,
  BIO_DB_SSL_ENABLED: booleanGetter,
  BIO_DB_USER: stringGetter,

  AWS_S3_ACCESS_KEY_ID: stringGetter,
  AWS_S3_SECRET_ACCESS_KEY: stringGetter,
  AWS_S3_BUCKET_NAME: stringGetter,
  AWS_S3_BUCKET_REGION: stringGetter,
  AWS_S3_ENDPOINT: stringGetter,
  AWS_S3_CORE_BUCKET_NAME: stringGetter,
  AWS_S3_LEGACY_BUCKET_NAME: stringGetter,
  AWS_S3_LEGACY_BUCKET_REGION: stringGetter,

  AWS_OSS_REGION: stringGetter,
  AWS_OSS_ACCESS_KEY_ID: stringGetter,
  AWS_OSS_SECRET_ACCESS_KEY: stringGetter,

  MAILCHIMP_TRANSACTIONAL_API_KEY: stringGetter,

  OPENSEARCH_HOST: stringGetter,
  OPENSEARCH_PORT: numberGetter,
  OPENSEARCH_SSL_ENABLED: booleanGetter,
  OPENSEARCH_HTTPAUTH_USER: stringGetter,
  OPENSEARCH_HTTPAUTH_PASSWORD: stringGetter,

  SLACK_TOKEN: stringGetter,

  ARBIMON_PROJECT_ID: numberGetter,
  PROJECT_ID: numberGetter,

  CORE_API_BASE_URL: stringGetter,
  ARBIMON_BASE_URL: stringGetter,
  MEDIA_API_BASE_URL: stringGetter,

  IUCN_BASE_URL: stringGetter,
  IUCN_TOKEN: stringGetter,

  WIKI_BASE_URL: stringGetter,
  WIKI_MEDIA_BASE_URL: stringGetter,

  CLASSIFIER_JOB_EXPORT_ID: stringGetter,
  CLASSIFIER_JOB_EXPORT_RECEIVER_EMAIL: stringGetter,
  CLASSIFIER_JOB_EXPORT_TYPES: stringGetter
} as const
