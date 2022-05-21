import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { IucnService } from '@/ingest/_connections/iucn'
import { requireEnv } from '~/env'
import { syncIucnSpeciesDescription } from './sync/sync-iucn-species-description'

const { IUCN_BASE_URL, IUCN_TOKEN } = requireEnv('IUCN_BASE_URL', 'IUCN_TOKEN')

const main = async (): Promise<void> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)
  const iucnService = new IucnService({ IUCN_BASE_URL, IUCN_TOKEN })

  await syncIucnSpeciesDescription(models, iucnService)
}

await main()
