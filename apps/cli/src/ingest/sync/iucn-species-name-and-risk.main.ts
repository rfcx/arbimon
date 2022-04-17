import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { IucnService } from '@/ingest/_connections/iucn'
import { syncIucnSpeciesNameAndRisk } from '@/ingest/sync/iucn/sync-iucn-species-name-and-risk'
import { requireEnv } from '~/env'

const { IUCN_BASE_URL, IUCN_TOKEN } = requireEnv('IUCN_BASE_URL', 'IUCN_TOKEN')

const main = async (): Promise<void> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)
  const iucnService = new IucnService({ IUCN_BASE_URL, IUCN_TOKEN })

  await syncIucnSpeciesNameAndRisk(models, iucnService)
}

await main()
