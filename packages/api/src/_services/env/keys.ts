/**
 * !WARNING: MANUAL ACTION REQUIRED!
 *
 * You must keep these file in sync:
 * - `build/api/production/config.yaml` -- CONFIG ONLY
 * - `build/api/staging/config.yaml` -- CONFIG ONLY
 * - `build/api/testing/config.yaml` -- CONFIG ONLY
 * - `build/api/secrets.example.yaml` -- SECRETS ONLY
 * - `packages/api/.env.example` -- BOTH
 * - `packages/api/src/_services/env/keys.ts` -- BOTH
 */

// CANNOT be undefined or an empty string
export const envKeysRequired = <const>[
  'IUCN_TOKEN',
  'IUCN_BASE_URL'
]

// CAN be undefined or empty string
export const envKeysOptional = <const>[
  'NODE_ENV',
  'FASTIFY_PORT',
  'FASTIFY_ADDRESS'
]
