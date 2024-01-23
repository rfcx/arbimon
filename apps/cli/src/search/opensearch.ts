import { defaultProvider } from '@aws-sdk/credential-provider-node'
import { Client } from '@opensearch-project/opensearch'
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws'

import { optionalEnv, requireEnv } from '~/env'

const { OPENSEARCH_HOST: host, OPENSEARCH_PORT: port, OPENSEARCH_SSL_ENABLED: isSsl, OPENSEARCH_AWS_BUCKET_REGION: region } = requireEnv('OPENSEARCH_HOST', 'OPENSEARCH_PORT', 'OPENSEARCH_SSL_ENABLED', 'OPENSEARCH_AWS_BUCKET_REGION')
const { OPENSEARCH_HTTPAUTH_USER: httpUser, OPENSEARCH_HTTPAUTH_PASSWORD: httpPassword } = optionalEnv('OPENSEARCH_HTTPAUTH_USER', 'OPENSEARCH_HTTPAUTH_PASSWORD')

export const getOpenSearchClient = (): Client => {
  const httpAuth = httpUser && httpPassword ? `${httpUser.trim()}:${httpPassword.trim()}@` : ''
  let node = `${isSsl ? 'https' : 'http'}://${httpAuth.trim()}${host.trim()}`
  node += host === 'localhost' ? `:${port}` : ''

  const awsCredentials = host === 'localhost'
    ? undefined
    : AwsSigv4Signer({
        region,
        service: 'es',
        getCredentials: async () => {
          const credentialsProvider = defaultProvider()
          return await credentialsProvider()
        }
      })

  const client = new Client({
    ...awsCredentials,
    node
  })

  return client
}
