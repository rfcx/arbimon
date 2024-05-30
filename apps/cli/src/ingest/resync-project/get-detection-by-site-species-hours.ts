import { type Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type DetectionBySiteSpeciesHour } from '@rfcx-bio/node-common/dao/types'

export type DetectionBySiteSpeciesHourWithArbimonId = DetectionBySiteSpeciesHour & { siteIdArbimon: number, speciesIdArbimon: number }

export const getDetectionBySiteSpeciesHours = async (sequelize: Sequelize, locationProjectId: number): Promise<DetectionBySiteSpeciesHourWithArbimonId[]> => {
  const { DetectionBySiteSpeciesHour, LocationSite, TaxonSpecies } = ModelRepository.getInstance(sequelize)
  const results = await DetectionBySiteSpeciesHour.findAll({
    where: { locationProjectId },
    attributes: [[sequelize.col('LocationSite.id_arbimon'), 'siteIdArbimon'], 'locationSiteId', [sequelize.col('TaxonSpecies.id_arbimon'), 'speciesIdArbimon'], 'taxonSpeciesId', 'timePrecisionHourLocal', 'countsByMinute'],
    include: [{
      model: LocationSite,
      attributes: []
    }, {
      model: TaxonSpecies,
      attributes: []
    }],
    order: [[sequelize.col('LocationSite.id_arbimon'), 'ASC'], [sequelize.col('TaxonSpecies.id_arbimon'), 'ASC'], ['timePrecisionHourLocal', 'ASC']],
    raw: true
  }) as unknown as DetectionBySiteSpeciesHourWithArbimonId[]
  return results
}
