import { Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_LOCATION_SITE } from '@rfcx-bio/common/dao/models/location-site-model'
import { Site, SyncError } from '@rfcx-bio/common/dao/types'

import { SiteArbimon } from '../parsers/parse-site-arbimon-to-bio'

const transformSiteArbimonToSiteBio = (site: SiteArbimon): Omit<Site, 'id'> => ({ ...site })

const loopUpsert = async (sites: SiteArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise< Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  const failedToInsertItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  for (const site of sites) {
    try {
      await ModelRepository.getInstance(sequelize).LocationSite.upsert(transformSiteArbimonToSiteBio(site))
    } catch (e: any) {
      const errorMessage = (e instanceof Error) ? e.message : ''
      // store insert errors
      failedToInsertItems.push({
        externalId: `${site.idArbimon}`,
        error: `InsertError: ${errorMessage}`
      })
    }
  }
  return failedToInsertItems
}

export const writeSitesToBio = async (sites: SiteArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise< Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  try {
    await ModelRepository.getInstance(sequelize)
      .LocationSite
      .bulkCreate(sites.map(transformSiteArbimonToSiteBio), {
        updateOnDuplicate: UPDATE_ON_DUPLICATE_LOCATION_SITE,
        ...transaction && { transaction }
      })
    return []
  } catch (batchInsertError) {
    console.info('⚠️ Batch insert failed... try loop upsert')
    return await loopUpsert(sites, sequelize)
  }
}
