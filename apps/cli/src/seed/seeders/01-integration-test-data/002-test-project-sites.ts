import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ProjectSite } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { testSite, testSite2, testSite3 } from '@/seed/data/integration/project-site'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // Create mocked projects sites
  const sites: ProjectSite[] = [testSite, testSite2, testSite3]
  await ModelRepository.getInstance(getSequelize())
    .ProjectSite
    .bulkCreate(sites)
}
