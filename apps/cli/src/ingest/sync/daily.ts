import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { getArbimonSequelize } from '@/ingest/_connections/arbimon'
import { createProjectVersionIfNeeded } from '@/ingest/outputs/project-version'
import { syncProjects } from '@/ingest/sync/projects'

const main = async (): Promise<void> => {
  console.info('Daily sync start')
  try {
    const bioSequelize = getSequelize()
    const arbimonSequelize = getArbimonSequelize()
    await syncProjects(arbimonSequelize, bioSequelize)

    const allProjectIds = (await ModelRepository.getInstance(bioSequelize).Project.findAll({ raw: true })).map(p => p.id)
    await createProjectVersionIfNeeded(bioSequelize, allProjectIds)
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('Daily sync end: failed')
  }
}

await main()
