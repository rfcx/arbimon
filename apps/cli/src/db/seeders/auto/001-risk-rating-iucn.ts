import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { RiskRatingIucnModel } from '@rfcx-bio/common/dao/models/risk-rating-iucn-model'
import { RiskRatingIucn } from '@rfcx-bio/common/dao/types'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  const data: RiskRatingIucn[] = [
    { idOrdered: -1, code: 'NE', isThreatened: false },
    { idOrdered: 0, code: 'NA', isThreatened: false },
    { idOrdered: 100, code: 'DD', isThreatened: false },
    { idOrdered: 200, code: 'LC', isThreatened: false },
    { idOrdered: 300, code: 'NT', isThreatened: false },
    { idOrdered: 400, code: 'VU', isThreatened: true },
    { idOrdered: 500, code: 'EN', isThreatened: true },
    { idOrdered: 600, code: 'CR', isThreatened: true },
    { idOrdered: 700, code: 'RE', isThreatened: false },
    { idOrdered: 800, code: 'EW', isThreatened: false },
    { idOrdered: 900, code: 'EX', isThreatened: false }
  ]

  await RiskRatingIucnModel(sequelize).bulkCreate(data)
}
