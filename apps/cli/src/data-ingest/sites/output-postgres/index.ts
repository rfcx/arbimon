import { LocationSiteModel } from '@rfcx-bio/common/dao/models/location-site-model'
import { Site } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '../../../db/connections'

export const writeSitesToPostgres = async (sites: Site[]): Promise<void> => {
  const sequelize = getSequelize()
  await LocationSiteModel(sequelize).bulkCreate(sites).then(async () => {
    // fix auto increment key break - https://github.com/sequelize/sequelize/issues/9295
    await sequelize.query('select setval(\'location_site_id_seq\', (select max(id) from location_site), true);')
  })
  console.info('writeSitesToPostgres: success')
}
