import { type ApiRoot, Client1_13 } from 'kubernetes-client'

const getClient = (): ApiRoot => new Client1_13({ version: '1.13' })

export const createJob = async (job: unknown): Promise<void> => {
  const client = getClient()
  await client.apis.batch.v1.namespaces('testing').jobs.post({ body: job })
}
