import { type Client } from '@opensearch-project/opensearch'

import { openSearchClient } from '@rfcx-bio/common/search/connections'

import { optionalEnv, requireEnv } from '~/env'

const {
  OPENSEARCH_HOST: host
} = requireEnv('OPENSEARCH_HOST')
const {
  OPENSEARCH_PORT: port,
  OPENSEARCH_SSL_ENABLED: ssl,
  OPENSEARCH_HTTPAUTH_USER: httpUser,
  OPENSEARCH_HTTPAUTH_PASSWORD: httpPassword,
  AWS_OSS_REGION: region,
  AWS_OSS_ACCESS_KEY_ID: accessKeyId,
  AWS_OSS_SECRET_ACCESS_KEY: secretAccessKey
} = optionalEnv('OPENSEARCH_PORT', 'OPENSEARCH_SSL_ENABLED', 'OPENSEARCH_HTTPAUTH_USER', 'OPENSEARCH_HTTPAUTH_PASSWORD', 'AWS_OSS_REGION', 'AWS_OSS_ACCESS_KEY_ID', 'AWS_OSS_SECRET_ACCESS_KEY')

export const getOpenSearchClient = (): Client => {
  const httpAuth = httpUser && httpPassword ? { user: httpUser, password: httpPassword } : undefined
  const aws = region && accessKeyId && secretAccessKey ? { region, accessKeyId, secretAccessKey } : undefined
  return openSearchClient(host, { port, ssl, httpAuth, aws })
}

export const ensureRequiredIndexInitialized = async (client: Client, index: string, indexSettings?: object): Promise<void> => {
  const availableIndexes = await client.cat.indices({ format: 'json', v: true }).then(res => res.body) as Array<{ index: string }>
  const isIndexExists = availableIndexes.find(ai => ai.index === index) !== undefined

  if (!isIndexExists) {
    await client.indices.create({
      index,
      body: indexSettings
    })
  }
}

export const refreshIndex = async (client: Client, index: string): Promise<void> => {
  await client.indices.refresh({ index }).catch(e => {
    if (e.statusCode === 404) {
      console.info('Refresh not supported (Likely AWS OpenSearch Serverless)')
    } else {
      throw e
    }
  })
}
