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

import { Protection, PROTECTION_VALUES } from './types'

// Getters
type Getter<T> = (env: Record<string, string>, key: string) => T | undefined

const stringGetter: Getter<string> = (env, key): string | undefined => env[key]
const numberGetter: Getter<number> = (env, key): number | undefined => Number(env[key])
const booleanGetter: Getter<boolean> = (env, key): boolean | undefined => env[key] === 'true'
const unionGetter = <T extends string> (allowed: T[]): Getter<T> => (env, key) => {
  const raw = env[key] as T
  return allowed.includes(raw) ? raw : undefined
}

// Env keys/types
export const envGetters = <const>{
  PROTECTION: unionGetter<Protection>(Object.values(PROTECTION_VALUES)),

  ARBIMON_DB_DBNAME: stringGetter,
  ARBIMON_DB_HOSTNAME: stringGetter,
  ARBIMON_DB_PASSWORD: stringGetter,
  ARBIMON_DB_USER: stringGetter,

  BIO_DB_DBNAME: stringGetter,
  BIO_DB_HOSTNAME: stringGetter,
  BIO_DB_PASSWORD: stringGetter,
  BIO_DB_PORT: numberGetter,
  BIO_DB_SSL_ENABLED: booleanGetter,
  BIO_DB_USER: stringGetter,

  IUCN_BASE_URL: stringGetter,
  IUCN_TOKEN: stringGetter,

  WIKI_BASE_URL: stringGetter,
  WIKI_MEDIA_BASE_URL: stringGetter,

  MOCK_PROJECT_NAME: stringGetter,
  MOCK_PROJECT_ID_CORE: stringGetter,
  MOCK_PROJECT_SLUG_ARBIMON: stringGetter
}
