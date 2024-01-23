import { defaultProvider } from '@aws-sdk/credential-provider-node'
import { Client } from '@opensearch-project/opensearch'
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws'

import { env } from '../env'

const {
  OPENSEARCH_HTTPAUTH_USER: opensearchHttpUser,
  OPENSEARCH_HTTPAUTH_PASSWORD: opensearchHttpPassword,
  OPENSEARCH_HOST: opensearchHost,
  OPENSEARCH_PORT: opensearchPort,
  OPENSEARCH_SSL_ENABLED: opensearchSslEnabled,
  OPENSEARCH_AWS_BUCKET_REGION: opensearchAwsBucketRegion
} = env

let opensearchClient: Client | undefined

/**
 * Singleton function that returns a single instance of opensearch if it's never been created.
 * This singleton functions supports both testing locally and running on the cloud
 * The way to separate the local and on-cloud instance is by using the host
 *
 * If the passed `OPENSEARCH_HOST` environment variable is `localhost`. We could assume that we're
 * connecting to the local host instance for testing
 */
export const getOpenSearchClient = (): Client => {
  if (opensearchClient === undefined) {
    const httpAuth = opensearchHttpUser && opensearchHttpPassword ? `${opensearchHttpUser.trim()}:${opensearchHttpPassword.trim()}@` : ''
    let node = `${opensearchSslEnabled === 'true' ? 'https' : 'http'}://${httpAuth.trim()}${opensearchHost.trim()}`
    node += opensearchHost === 'localhost' ? `:${opensearchPort}` : ''

    const awsCredentials = opensearchHost === 'localhost'
      ? undefined
      : AwsSigv4Signer({
          region: opensearchAwsBucketRegion,
          service: 'es',
          getCredentials: async () => {
            const credentialsProvider = defaultProvider()
            return await credentialsProvider()
          }
        })

    opensearchClient = new Client({
      ...awsCredentials,
      node
    })
  }

  return opensearchClient
}
