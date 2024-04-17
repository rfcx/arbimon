import kubernetes, { type ApiRoot } from 'kubernetes-client'

const { Client1_13: Client } = kubernetes

const getClient = (): ApiRoot => new Client({ version: '1.13' })

export const createJob = async (job: unknown): Promise<void> => {
  const client = getClient()
  await client.apis.batch.v1.namespaces('testing').jobs.post({ body: job })
}
