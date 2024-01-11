import { Client } from '@opensearch-project/opensearch'

import { optionalEnv, requireEnv } from '~/env'

const { OPENSEARCH_HOST: host, OPENSEARCH_PORT: port, OPENSEARCH_SSL_ENABLED: isSsl } = requireEnv('OPENSEARCH_HOST', 'OPENSEARCH_PORT', 'OPENSEARCH_SSL_ENABLED')
const { OPENSEARCH_HTTPAUTH_USER: httpUser, OPENSEARCH_HTTPAUTH_PASSWORD: httpPassword } = optionalEnv('OPENSEARCH_HTTPAUTH_USER', 'OPENSEARCH_HTTPAUTH_PASSWORD')

export const getOpenSearchClient = (): Client => {
  const httpAuth = httpUser && httpPassword ? `${httpUser}:${httpPassword}@` : ''
  const node = `${isSsl ? 'https' : 'http'}://${httpAuth}${host}:${port}`
  console.info('node', node)
  const client = new Client({ node })
  return client
}
