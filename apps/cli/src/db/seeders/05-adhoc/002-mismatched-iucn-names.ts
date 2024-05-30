import { type QueryInterface, Op } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { RiskRatingIucnModel } from '@rfcx-bio/node-common/dao/models/risk-rating-iucn-model'
import { TaxonSpeciesIucnModel } from '@rfcx-bio/node-common/dao/models/taxon-species-iucn-model'
import { TaxonSpeciesModel } from '@rfcx-bio/node-common/dao/models/taxon-species-model'

import { syncIucnSpeciesInfo } from '@/ingest/external/iucn'

const mismatchedNames: Record<string, string> = {
  // Arbimon name : IUCN name
  'Camarhynchus pallidus': 'Geospiza pallida',
  'Camarhynchus heliobates': 'Geospiza heliobates',
  'Corvus cornix': 'Hooded Crow',
  'Pelophylax esculentus': 'the Edible Frog',
  'Parus cinereus': 'Cinereus Tit'
}

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // Lookups
  const iucnNameToSpeciesId: Record<string, number> = await TaxonSpeciesModel(sequelize)
    .findAll({ attributes: ['id', 'scientificName'], where: { scientificName: { [Op.in]: Object.keys(mismatchedNames) } } })
    .then(species => Object.fromEntries(species.map(s => [mismatchedNames[s.scientificName], s.id]).filter(s => s[0] !== undefined)))
  const iucnCodeToId: Record<string, number> = await RiskRatingIucnModel(sequelize).findAll()
    .then(allRatings => Object.fromEntries(allRatings.map(r => [r.code, r.id])))

  const taxonSpeciesIucn: Record<number, number> = await TaxonSpeciesIucnModel(sequelize)
    .findAll({ attributes: ['taxonSpeciesId', 'riskRatingIucnId'], where: { taxonSpeciesId: { [Op.in]: Object.values(iucnNameToSpeciesId) } } })
    .then(taxons => Object.fromEntries(taxons.map(t => [t.taxonSpeciesId, t.riskRatingIucnId])))

  // Explain update plan
  console.info('Plan:')
  for (const name in mismatchedNames) {
    const speciesId = iucnNameToSpeciesId[mismatchedNames[name]]
    if (speciesId) {
      console.info(`${name} (id=${speciesId}) will be matched to IUCN data for ${mismatchedNames[name]}`)
    } else {
      console.info(`${name} not found`)
    }
  }

  let iucnNameToSpeciesIdWithRiskId: Record<string, { id: number, riskRatingIucnId: number }> = {}
  for (const species in iucnNameToSpeciesId) {
    const temp = {
      [iucnNameToSpeciesId[species]]: {
        id: Number(species),
        riskRatingIucnId: taxonSpeciesIucn[Number(species)]
      }
    }
    iucnNameToSpeciesIdWithRiskId = Object.assign(temp)
  }

  // Get IUCN data and insert
  await syncIucnSpeciesInfo(sequelize, iucnNameToSpeciesIdWithRiskId, iucnCodeToId).catch(err => { console.error(err.message) })
}
