import { Optional, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { LocationSiteModel } from '@rfcx-bio/common/dao/models/location-site-model'
import { Site } from '@rfcx-bio/common/dao/types'
import { rawSites } from '@rfcx-bio/common/mock-data'

import { getPuertoRicoProjectId } from '@/db/_helpers/get-puerto-rico-id'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  const prId = await getPuertoRicoProjectId(sequelize)
  if (Number.isNaN(prId)) return

  // Save mock sites under PR project
  const sites: Array<Optional<Site, 'id'>> = rawSites
    .map(({ id, locationProjectId, ...rest }) => ({
      ...rest,
      locationProjectId: prId
    }))

  await LocationSiteModel(sequelize).bulkCreate(sites)
}
