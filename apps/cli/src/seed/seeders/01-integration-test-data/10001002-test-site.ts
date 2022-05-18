import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ProjectSite } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

export const testSite: ProjectSite = {
  id: 10001,
  idCore: 'testSite0001',
  idArbimon: 1111222,
  projectId: 10001,
  projectVersionFirstAppearsId: 10001,
  name: 'Test Site',
  latitude: 18.31307,
  longitude: -65.24878,
  altitude: 30.85246588
}

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // Create mocked projects sites
  const sites: ProjectSite[] = [testSite]
  await ModelRepository.getInstance(getSequelize())
    .ProjectSite
    .bulkCreate(sites)
}
