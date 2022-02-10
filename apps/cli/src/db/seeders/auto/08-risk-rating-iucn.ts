import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { RiskRatingIucnModel } from '@rfcx-bio/common/dao/models/risk-rating-iucn-model'
import { RiskRatingIucn } from '@rfcx-bio/common/dao/types/risk-rating-iucn'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  const data: RiskRatingIucn[] = [
    { id: 100, code: 'NE', isThreatened: false },
    { id: 200, code: 'NA', isThreatened: false },
    { id: 300, code: 'DD', isThreatened: false },
    { id: 400, code: 'LC', isThreatened: false },
    { id: 500, code: 'NT', isThreatened: false },
    { id: 600, code: 'VU', isThreatened: true },
    { id: 700, code: 'EN', isThreatened: true },
    { id: 800, code: 'CR', isThreatened: true },
    { id: 900, code: 'RE', isThreatened: false },
    { id: 1000, code: 'EW', isThreatened: false },
    { id: 1100, code: 'EX', isThreatened: false }
  ]

  await RiskRatingIucnModel(sequelize).bulkCreate(data)
}
