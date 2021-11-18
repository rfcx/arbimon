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
