import { type Client } from '@opensearch-project/opensearch'

import { openSearchClient } from '@rfcx-bio/node-common/search/connections'

import { env } from '../env'

let client: Client | undefined

const {
  OPENSEARCH_HOST: host,
  OPENSEARCH_PORT: portString,
  OPENSEARCH_SSL_ENABLED: sslString,
  OPENSEARCH_HTTPAUTH_USER: httpUser,
  OPENSEARCH_HTTPAUTH_PASSWORD: httpPassword,
  AWS_OSS_REGION: region,
  AWS_OSS_ACCESS_KEY_ID: accessKeyId,
  AWS_OSS_SECRET_ACCESS_KEY: secretAccessKey
} = env

/**
 * Singleton function that returns a single instance of opensearch if it's never been created.
 * This singleton functions supports both testing locally and running on the cloud
 * The way to separate the local and on-cloud instance is by using the host
 */
export const getOpenSearchClient = (): Client => {
  if (client === undefined) {
    const port = Number(portString)
    const ssl = sslString === 'true'
    const httpAuth = httpUser && httpPassword ? { user: httpUser, password: httpPassword } : undefined
    const aws = region && accessKeyId && secretAccessKey ? { region, accessKeyId, secretAccessKey } : undefined
    client = openSearchClient(host, { port, ssl, httpAuth, aws }, false)
  }
  return client
}
