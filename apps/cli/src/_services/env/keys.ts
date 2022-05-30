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

import { BIO_ENVIRONMENT_VALUES, BioEnvironment, Protection, PROTECTION_VALUES } from './types'

// Getters
type Getter<T> = (env: Record<string, string>, key: string) => T | undefined

const stringGetter: Getter<string> = (env, key): string | undefined => {
  const raw = env[key]
  return raw.length > 0 ? raw : undefined
}

const numberGetter: Getter<number> = (env, key): number | undefined => {
  const raw = env[key]
  return raw.length > 0 ? Number(raw) : undefined
}

const booleanGetter: Getter<boolean> = (env, key): boolean | undefined => env[key] === 'true'

const unionGetter = <T extends string> (allowed: T[]): Getter<T> => (env, key) => {
  const raw = env[key] as T
  return allowed.includes(raw) ? raw : undefined
}

// Env keys/types
export const envGetters = <const>{
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

  CORE_API_BASE_URL: stringGetter,

  IUCN_BASE_URL: stringGetter,
  IUCN_TOKEN: stringGetter,

  WIKI_BASE_URL: stringGetter,
  WIKI_MEDIA_BASE_URL: stringGetter
}
