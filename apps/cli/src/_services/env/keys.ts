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
  'USERNAME',
  'PASSWORD',
  'DATABASE',
  'HOST',
  'IUCN_TOKEN',
  'IUCN_BASE_URL',
  'WIKI_BASE_URL'
]

// CAN be undefined or empty string
export const envKeysOptional = <const>[]
