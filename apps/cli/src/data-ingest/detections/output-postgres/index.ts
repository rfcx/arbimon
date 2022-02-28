import { Sequelize } from 'sequelize'

import { ATTRIBUTES_DETECTION_BY_SITE_SPECIES_HOUR, DetectionBySiteSpeciesHourModel } from '@rfcx-bio/common/dao/models/detection-by-site-species-hour-model'
import { LocationSiteModel } from '@rfcx-bio/common/dao/models/location-site-model'
import { TaxonClassModel } from '@rfcx-bio/common/dao/models/taxon-class-model'
import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { DetectionBySiteSpeciesHour, Project } from '@rfcx-bio/common/dao/types'
import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'

export const writeDetectionsToPostgres = async (sequelize: Sequelize, detections: MockHourlyDetectionSummary[], project: Project | undefined = undefined): Promise<void> => {
  // TODO - Write data to Bio DB
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
      taxonClassId: classArbimonToBio[d.taxon_id] ?? -1,
      taxonSpeciesId: speciesArbimonToBio[d.species_id] ?? -1,
      locationProjectId: project?.id ?? 1,
      locationSiteId: siteArbimonToBio[d.arbimon_site_id] ?? -1,
      count: d.num_of_recordings,
      durationMinutes: 12
    }))

  await DetectionBySiteSpeciesHourModel(sequelize).bulkCreate(data, {
    updateOnDuplicate: ATTRIBUTES_DETECTION_BY_SITE_SPECIES_HOUR.light
  })
}
