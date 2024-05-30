import { type Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type Site } from '@rfcx-bio/node-common/dao/types'

export const getSites = async (sequelize: Sequelize, locationProjectId: number): Promise<Site[]> => {
  const { LocationSite } = ModelRepository.getInstance(sequelize)
  const result = await LocationSite.findAll({ where: { locationProjectId }, order: [['id_arbimon', 'ASC']] })
  return result.map(s => s.toJSON())
}
