import { Client } from '@opensearch-project/opensearch'

import { env } from '../env'

const {
  OPENSEARCH_HTTPAUTH_USER: opensearchHttpUser,
  OPENSEARCH_HTTPAUTH_PASSWORD: opensearchHttpPassword,
  OPENSEARCH_HOST: opensearchHost,
  OPENSEARCH_PORT: opensearchPort,
  OPENSEARCH_SSL_ENABLED: opensearchSslEnabled
} = env

let opensearchClient: Client | undefined
export const getOpenSearchClient = (): Client => {
  if (opensearchClient === undefined) {
    const httpAuth = opensearchHttpUser && opensearchHttpPassword ? `${opensearchHttpUser.trim()}:${opensearchHttpPassword.trim()}@` : ''
    const node = `${opensearchSslEnabled === 'true' ? 'https' : 'http'}://${httpAuth.trim()}${opensearchHost.trim()}:${opensearchPort}`
    opensearchClient = new Client({ node })
  }

  return opensearchClient
}
