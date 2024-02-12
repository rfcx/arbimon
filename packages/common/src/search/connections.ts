import { Client } from '@opensearch-project/opensearch'
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws'

export const openSearchClient = (host: string, config: { port?: number, ssl?: boolean, httpAuth?: { user: string, password: string }, aws?: { region: string, accessKeyId: string, secretAccessKey: string } }, verbose: boolean = true): Client => {
  const httpAuth = config.httpAuth ? `${config.httpAuth.user}:${config.httpAuth.password}@` : ''
  const node = `${config.ssl === true ? 'https' : 'http'}://${httpAuth}${host}${config.port !== undefined && config.port > 0 ? ':' + config.port.toString() : ''}`
  if (verbose) {
    console.info('Instantiating OpenSearch client for node:', node)
  }

  if (config.aws) {
    const { region, ...credentials } = config.aws
    if (verbose) {
      console.info('Instantiating OpenSearch client with AWS credentials, region:', region)
    }
    const signer = AwsSigv4Signer({
      region,
      service: 'aoss',
      getCredentials: async () => await Promise.resolve(credentials)
    })
    return new Client({ ...signer, node })
  }

  return new Client({ node })
}
