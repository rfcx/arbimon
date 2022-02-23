import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '../db'

export async function isProtectedSpecies (riskRatingIucnId: number): Promise<boolean> {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const protectedCodes = await models.RiskRatingIucn.findAll({
    where: {
      isThreatened: true
    },
    raw: true
  })

  return protectedCodes.map(({ idOrdered }) => idOrdered).includes(riskRatingIucnId)
}
