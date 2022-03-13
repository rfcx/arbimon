import { Op, Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionBySiteSpeciesHourModel } from '@rfcx-bio/common/dao/models/detection-by-site-species-hour-model'
import { LocationSiteModel } from '@rfcx-bio/common/dao/models/location-site-model'
import { TaxonClassModel } from '@rfcx-bio/common/dao/models/taxon-class-model'
import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { ATTRIBUTES_DETECTION_BY_SITE_SPECIES_HOUR, DetectionBySiteSpeciesHour, Project, TaxonSpecies } from '@rfcx-bio/common/dao/types'
import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'

import { ArbimonHourlyDetectionSummary } from '@/data-ingest/detections/input'

export const writeDetections = async (sequelize: Sequelize, detections: ArbimonHourlyDetectionSummary[], project: Project | undefined = undefined): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)
  const [species, sites] = await Promise.all([
    models.TaxonSpecies.findAll(),
    models.LocationSite.findAll()
  ])

  const speciesArbimonToBio: Record<number, TaxonSpecies> = Object.fromEntries(species.map(s => [s.idArbimon, s]))
  const siteArbimonToBio: Record<number, number> = Object.fromEntries(sites.map(s => [s.idArbimon, s.id]))

  const data: DetectionBySiteSpeciesHour[] =
    detections.map(d => ({
      timePrecisionHourLocal: d.datetime,
      taxonClassId: speciesArbimonToBio[d.species_id].taxonClassId ?? -1, // TODO: Throw error
      taxonSpeciesId: speciesArbimonToBio[d.species_id].id ?? -1, // TODO: Throw error
      locationProjectId: project?.id ?? 1,
      locationSiteId: siteArbimonToBio[d.site_id] ?? -1, // TODO: Throw error
      count: d.detection_count,
      durationMinutes: d.duration_in_minutes
    }))

  await DetectionBySiteSpeciesHourModel(sequelize).bulkCreate(data, {
    updateOnDuplicate: ATTRIBUTES_DETECTION_BY_SITE_SPECIES_HOUR.updateOnDuplicate
  })

  // delete non exist items
  await models.DetectionBySiteSpeciesHour.destroy({
    where: {
      timePrecisionHourLocal: {
        [Op.ne]: null,
        [Op.notIn]: data.map(i => i.timePrecisionHourLocal.toISOString())
      }
    }
  }).then(numberOfDeletedRows => {
    console.info('| - deleted %d detections summaries', numberOfDeletedRows)
  })
}

export const writeDetectionsToPostgres = async (sequelize: Sequelize, detections: MockHourlyDetectionSummary[], project: Project | undefined = undefined): Promise<void> => {
  const [classes, species, sites] = await Promise.all([
    TaxonClassModel(sequelize).findAll(),
    TaxonSpeciesModel(sequelize).findAll(),
    LocationSiteModel(sequelize).findAll()
  ])

  const classArbimonToBio: Record<number, number> = Object.fromEntries(classes.map(c => [c.idArbimon, c.id]))
  const speciesArbimonToBio: Record<number, number> = Object.fromEntries(species.map(s => [s.idArbimon, s.id]))
  const siteArbimonToBio: Record<number, number> = Object.fromEntries(sites.map(s => [s.idArbimon, s.id]))

  const data: DetectionBySiteSpeciesHour[] =
    detections.map(d => ({
      timePrecisionHourLocal: new Date(new Date(d.date).getTime() + d.hour * 60 * 60 * 1000),
      taxonClassId: classArbimonToBio[d.taxon_id] ?? -1, // TODO: Throw error
      taxonSpeciesId: speciesArbimonToBio[d.species_id] ?? -1, // TODO: Throw error
      locationProjectId: project?.id ?? 1,
      locationSiteId: siteArbimonToBio[d.arbimon_site_id] ?? -1, // TODO: Throw error
      count: d.num_of_recordings,
      durationMinutes: 12
    }))

  await DetectionBySiteSpeciesHourModel(sequelize).bulkCreate(data, {
    updateOnDuplicate: ATTRIBUTES_DETECTION_BY_SITE_SPECIES_HOUR.updateOnDuplicate
  })
}
