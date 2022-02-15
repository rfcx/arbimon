import { Optional, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { LocationSiteModel } from '@rfcx-bio/common/dao/models/location-site-model'
import { Site } from '@rfcx-bio/common/dao/types'
import { rawSites } from '@rfcx-bio/common/mock-data'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const siteDao = LocationSiteModel(params.context.sequelize)

  const mockProjectId = 1

  const sites: Array<Optional<Site, 'id'>> =
    rawSites.map(({ id, locationProjectId, ...rest }) => ({ ...rest, locationProjectId: mockProjectId }))

  await siteDao.bulkCreate(sites)
}
