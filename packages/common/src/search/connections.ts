import { Client } from '@opensearch-project/opensearch'
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws'

export const openSearchClient = (host: string, config: { port?: number, ssl?: boolean, httpAuth?: { user: string, password: string }, aws?: { region: string, accessKeyId: string, secretAccessKey: string } }): Client => {
  const httpAuth = config.httpAuth ? `${config.httpAuth.user}:${config.httpAuth.password}@` : ''
  const node = `${config.ssl === true ? 'https' : 'http'}://${httpAuth}${host}${config.port !== undefined ? ':' + config.port.toString() : ''}`

  if (config.aws) {
    const { region, ...credentials } = config.aws
    const signer = AwsSigv4Signer({
      region,
      service: 'aoss',
      getCredentials: async () => await Promise.resolve(credentials)
    })
    return new Client({ node, ...signer })
  }

  return new Client({ node })
}