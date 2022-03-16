import * as hash from 'object-hash'
import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { DataSourceModel } from '@rfcx-bio/common/dao/models/datasource-model'
import { DetectionBySiteSpeciesHourModel } from '@rfcx-bio/common/dao/models/detection-by-site-species-hour-model'
import { LocationSiteModel } from '@rfcx-bio/common/dao/models/location-site-model'
import { ProjectVersionModel } from '@rfcx-bio/common/dao/models/project-version-model'
import { TaxonClassModel } from '@rfcx-bio/common/dao/models/taxon-class-model'
import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { ATTRIBUTES_DETECTION_BY_SITE_SPECIES_HOUR, DetectionBySiteSpeciesHour } from '@rfcx-bio/common/dao/types'
import { rawDetections } from '@rfcx-bio/common/mock-data'

import { getPuertoRicoProjectId } from '@/db/_helpers/get-puerto-rico-id'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // Lookups
  const [puertoRicoProjectId, classes, species, sites] = await Promise.all([
    getPuertoRicoProjectId(sequelize),
    TaxonClassModel(sequelize).findAll(),
    TaxonSpeciesModel(sequelize).findAll(),
    LocationSiteModel(sequelize).findAll()
  ])
  if (Number.isNaN(puertoRicoProjectId)) return

  const classArbimonToBio: Record<number, number> = Object.fromEntries(classes.map(c => [c.idArbimon, c.id]))
  const speciesArbimonToBio: Record<number, number> = Object.fromEntries(species.map(s => [s.idArbimon, s.id]))
  const siteArbimonToBio: Record<number, number> = Object.fromEntries(sites.map(s => [s.idArbimon, s.id]))

  // Save data
  await ProjectVersionModel(sequelize)
    .create({
      locationProjectId: puertoRicoId,
      isPublished: false,
      isPublic: false
    })

  const detectionSummaries: DetectionBySiteSpeciesHour[] = rawDetections
    .map(d => ({
      timePrecisionHourLocal: new Date(new Date(d.date).getTime() + d.hour * 60 * 60 * 1000),
      taxonClassId: classArbimonToBio[d.taxon_id] ?? -1, // TODO: Throw error
      taxonSpeciesId: speciesArbimonToBio[d.species_id] ?? -1, // TODO: Throw error
      locationProjectId: puertoRicoProjectId,
      locationSiteId: siteArbimonToBio[d.arbimon_site_id] ?? -1, // TODO: Throw error
      count: d.num_of_recordings,
      durationMinutes: 12
    }))

  await DataSourceModel(sequelize)
    .create({
      id: hash.MD5([{ 123: 456 }]),
      locationProjectId: puertoRicoId,
      summaryText: JSON.stringify({
        species: 500,
        sites: 90
      })
    })

  await DetectionBySiteSpeciesHourModel(sequelize)
    .bulkCreate(detectionSummaries, {
      updateOnDuplicate: ATTRIBUTES_DETECTION_BY_SITE_SPECIES_HOUR.updateOnDuplicate
    })
}

/**
 * latest => findOne(...) ~~ SELECT * FROM project_version ORDER BY created_at DESC LIMIT 1
 * most-recent published => findOne(...) ~~ SELECT * FROM project_version WHERE is_published=true ORDER BY created_at DESC LIMIT 1
 */
