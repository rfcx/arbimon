import { type Optional, type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { rawSites } from '@rfcx-bio/common/mock-data'
import { LocationSiteModel } from '@rfcx-bio/node-common/dao/models/location-site-model'
import { type Site } from '@rfcx-bio/node-common/dao/types'

import { getPuertoRicoProjectId } from '@/db/_helpers/get-puerto-rico-id'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // Lookups
  const puertoRicoProjectId = await getPuertoRicoProjectId(sequelize)
  if (Number.isNaN(puertoRicoProjectId)) return

  // Save mock sites under PR project
  const sites: Array<Optional<Site, 'id'>> = rawSites
    .map(({ id, locationProjectId, ...rest }) => ({
      ...rest,
      locationProjectId: puertoRicoProjectId
    }))

  await LocationSiteModel(sequelize).bulkCreate(sites)
}
