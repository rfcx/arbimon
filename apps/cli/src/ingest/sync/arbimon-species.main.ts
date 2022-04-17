import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { getArbimonSequelize } from '@/ingest/_connections/arbimon'
import { syncArbimonSpecies } from '@/ingest/sync/arbimon/sync-arbimon-species'

const main = async (): Promise<void> => {
  const sequelizeArbimon = getArbimonSequelize()
  const sequelizeBio = getSequelize()
  const models = ModelRepository.getInstance(sequelizeBio)

  await syncArbimonSpecies(sequelizeArbimon, models)
}

await main()
