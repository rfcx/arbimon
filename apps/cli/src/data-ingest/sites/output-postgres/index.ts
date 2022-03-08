import { Sequelize } from 'sequelize'

import { LocationSiteModel } from '@rfcx-bio/common/dao/models/location-site-model'
import { ATTRIBUTES_LOCATION_SITE, Site } from '@rfcx-bio/common/dao/types'

export const writeSitesToPostgres = async (sequelize: Sequelize, sites: Site[]): Promise<void> => {
  await LocationSiteModel(sequelize)
    .bulkCreate(sites, {
       updateOnDuplicate: ATTRIBUTES_LOCATION_SITE.updateOnDuplicate
    })
    .then(async () => {
      // fix auto increment key break - https://github.com/sequelize/sequelize/issues/9295
      await sequelize.query('select setval(\'location_site_id_seq\', (select max(id) from location_site), true);')
    })
}
