import { /* Optional, */ QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

// import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
// import { TaxonSpecies } from '@rfcx-bio/common/dao/types'

// import { rawSpecies } from '../../data/manual/taxon-species'

// import * as hash from 'object-hash'
// import { QueryInterface } from 'sequelize'
// import { MigrationFn } from 'umzug'

// import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
// import { ATTRIBUTES_DETECTION_BY_SITE_SPECIES_HOUR, DetectionByVersionSiteSpeciesHour } from '@rfcx-bio/common/dao/types'
// import { rawDetections } from '@rfcx-bio/common/mock-data'

// import { getPuertoRicoProjectId } from '@/db/_helpers/get-puerto-rico-id'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // TODO: Mock sync detections & species from arbimon

  // FROM SPECIES SEED

  // const models = ModelRepository.getInstance(params.context.sequelize)

  // // Lookups
  // const taxonClassArbimonToBio = await models
  //   .TaxonClass
  //   .findAll()
  //   .then(res => Object.fromEntries(res.map(t => [t.idArbimon, t.id])))

  // // Save
  // const data: Array<Optional<TaxonSpecies, 'id'>> =
  //   rawSpecies.map(s => ({
  //     idArbimon: s.speciesId,
  //     slug: s.speciesSlug,
  //     taxonClassId: taxonClassArbimonToBio[s.taxonId],
  //     scientificName: s.scientificName
  //   }))

  // await models.TaxonSpecies.bulkCreate(data)

  // FROM DETECTION SEED

  // const sequelize = params.context.sequelize
  // const models = ModelRepository.getInstance(sequelize)

  // // Lookups
  // const [puertoRicoProjectId, classes, species, sites] = await Promise.all([
  //   getPuertoRicoProjectId(sequelize),
  //   models.TaxonClass.findAll(),
  //   models.TaxonSpecies.findAll(),
  //   models.ProjectSite.findAll()
  // ])
  // if (Number.isNaN(puertoRicoProjectId)) return

  // const classArbimonToBio: Record<number, number> = Object.fromEntries(classes.map(c => [c.idArbimon, c.id]))
  // const speciesArbimonToBio: Record<number, number> = Object.fromEntries(species.map(s => [s.idArbimon, s.id]))
  // const siteArbimonToBio: Record<number, number> = Object.fromEntries(sites.map(s => [s.idArbimon, s.id]))

  // // Save data
  // await models.ProjectVersion
  //   .create({
  //     projectId: puertoRicoProjectId,
  //     isPublished: false,
  //     isPublic: false
  //   })

  // const detectionSummaries: DetectionByVersionSiteSpeciesHour[] = rawDetections
  //   .map(d => ({
  //     timePrecisionHourLocal: new Date(new Date(d.date).getTime() + d.hour * 60 * 60 * 1000),
  //     taxonClassId: classArbimonToBio[d.taxon_id] ?? -1, // TODO: Throw error
  //     taxonSpeciesId: speciesArbimonToBio[d.species_id] ?? -1, // TODO: Throw error
  //     projectId: puertoRicoProjectId,
  //     locationSiteId: siteArbimonToBio[d.arbimon_site_id] ?? -1, // TODO: Throw error
  //     count: d.num_of_recordings,
  //     durationMinutes: 12
  //   }))

  // await models.DataSource
  //   .create({
  //     id: hash.MD5([{ 123: 456 }]),
  //     projectId: puertoRicoProjectId,
  //     summaryText: JSON.stringify({
  //       species: 500,
  //       sites: 90
  //     })
  //   })

  // await models.DetectionBySiteSpeciesHour
  //   .bulkCreate(detectionSummaries, {
  //     updateOnDuplicate: UPDATE_ON_DUPLICATE_ATTRIBUTES_DETECTION_BY_SITE_SPECIES_HOUR
  //   })
}
