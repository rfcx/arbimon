import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionBySiteSpeciesHourModel, UPDATE_ON_DUPLICATE_DETECTION_BY_SITE_SPECIES_HOUR } from '@rfcx-bio/common/dao/models/detection-by-site-species-hour-model'
import { DetectionBySiteSpeciesHour, Project, TaxonSpecies } from '@rfcx-bio/common/dao/types'

import { ArbimonHourlyDetectionSummary } from '@/data-ingest/detections/arbimon'

export const writeDetections = async (sequelize: Sequelize, detections: ArbimonHourlyDetectionSummary[], project: Project): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  console.info('STEP: write %d detections to %s', detections.length, project?.name || '')

  const [species, sites] = await Promise.all([
    models.TaxonSpecies.findAll(),
    models.LocationSite.findAll()
  ])

  const speciesArbimonToBio: Record<number, TaxonSpecies> = Object.fromEntries(species.map(s => [s.idArbimon, s]))
  const siteArbimonToBio: Record<number, number> = Object.fromEntries(sites.map(s => [s.idArbimon, s.id]))

  const data: DetectionBySiteSpeciesHour[] =
    detections.map(d => ({
      timePrecisionHourLocal: new Date(new Date(d.date).getTime() + d.hour * 60 * 60 * 1000),
      taxonClassId: speciesArbimonToBio[d.species_id].taxonClassId ?? -1, // TODO: Throw error
      taxonSpeciesId: speciesArbimonToBio[d.species_id].id ?? -1, // TODO: Throw error
      locationProjectId: project.id,
      locationSiteId: siteArbimonToBio[d.site_id] ?? -1, // TODO: Throw error
      count: d.detection_count,
      durationMinutes: d.duration_in_minutes
    }))

  await DetectionBySiteSpeciesHourModel(sequelize).bulkCreate(data, {
    updateOnDuplicate: UPDATE_ON_DUPLICATE_DETECTION_BY_SITE_SPECIES_HOUR
  })

  // TODO: #691 the database connection got cut off when there is a lot of detection rows (20k+) in the query where clause
  // delete non exist items
  // await models.DetectionBySiteSpeciesHour.destroy({
  //   where: {
  //     timePrecisionHourLocal: {
  //       [Op.ne]: null,
  //       [Op.notIn]: data.map(i => i.timePrecisionHourLocal.toISOString())
  //     },
  //     locationProjectId: project.id
  //   }
  // }).then(numberOfDeletedRows => {
  //   console.info('| deleted %d detections summaries', numberOfDeletedRows)
  // })
}
