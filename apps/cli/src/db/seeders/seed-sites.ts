import { Optional, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { Site } from '@rfcx-bio/common/api-bio/common/sites'
import { SiteModel } from '@rfcx-bio/common/dao/models/site-model'
import { rawSites } from '@rfcx-bio/common/mock-data'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const siteDao = SiteModel(params.context.sequelize)

  const sites: Array<Optional<Site, 'id'>> =
    rawSites.map(({ id, ...rest }) => rest)

  await siteDao.bulkCreate(sites)
}
