import { type Client } from '@opensearch-project/opensearch'

import { openSearchClient } from '@rfcx-bio/node-common/search/connections'

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
} = optionalEnv(
  'OPENSEARCH_PORT',
  'OPENSEARCH_SSL_ENABLED',
  'OPENSEARCH_HTTPAUTH_USER',
  'OPENSEARCH_HTTPAUTH_PASSWORD',
  'AWS_OSS_REGION',
  'AWS_OSS_ACCESS_KEY_ID',
  'AWS_OSS_SECRET_ACCESS_KEY'
)

export const getOpenSearchClient = (): Client => {
  const httpAuth = httpUser && httpPassword ? { user: httpUser, password: httpPassword } : undefined
  const aws = region && accessKeyId && secretAccessKey ? { region, accessKeyId, secretAccessKey } : undefined
  return openSearchClient(host, { port, ssl, httpAuth, aws })
}

export const getAvailableIndexes = async (client: Client): Promise<Array<{ index: string }>> => {
  return await client.cat.indices({ format: 'json', v: true }).then(res => res.body) as Array<{ index: string }>
}

export const ensureRequiredIndexInitialized = async (client: Client, index: string, indexSettings?: object): Promise<void> => {
  const availableIndexes = await getAvailableIndexes(client)
  const isIndexExists = availableIndexes.find(ai => ai.index === index) !== undefined

  if (!isIndexExists) {
    await createIndex(client, index, indexSettings)
  }
}

export const deleteIndex = async (client: Client, index: string): Promise<void> => {
  await client.indices.delete({ index })
}

export const createIndex = async (client: Client, index: string, body?: object): Promise<void> => {
  await client.indices.create({ index, body })
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

export const deleteDocument = async (client: Client, index: string, id: string): Promise<void> => {
  await client.delete({ index, id }).catch(e => {
    if (e.statusCode === 404) {
      console.info('- project id', id, 'already removed in opensearch')
    } else {
      throw e
    }
  })
}
