import { groupBy } from 'lodash-es'
import * as hash from 'object-hash'
import { QueryInterface, QueryTypes } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterSources } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SourceDetectionBySyncSiteSpeciesHour, SourceRecordingBySyncSiteHour } from '@rfcx-bio/common/dao/types'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { getPuertoRicoProjectId } from '@/seed/_helpers/get-puerto-rico-id'
import { rawDetections } from '@/seed/data/manual/detections-by-hour'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize
  const models = ModelRepository.getInstance(sequelize)

  // Get lookups
  const [projectId, species, sites] = await Promise.all([
    getPuertoRicoProjectId(sequelize),
    models.TaxonSpecies.findAll({ attributes: ['id', 'idArbimon'], raw: true }),
    models.ProjectSite.findAll({ attributes: ['id', 'idArbimon'], raw: true })
  ])
  if (Number.isNaN(projectId)) throw new Error('Puerto Rico project doesn\'t exist')

  const latestProjectVersion = await models.ProjectVersion.findOne({
    where: { projectId },
    order: [['createdAt', 'DESC']]
  })
  if (!latestProjectVersion) throw new Error('Puerto Rico project has no versions')

  const speciesArbimonToBio: Record<number, number> = Object.fromEntries(species.map(s => [s.idArbimon, s.id]))
  const siteArbimonToBio: Record<number, number> = Object.fromEntries(sites.map(s => [s.idArbimon, s.id]))

  // Create sync
  const sync = await models.SourceSync.create({
    projectId,
    sourceId: masterSources.ArbimonValidated.id,
    hash: hash.MD5([{ abc: 456 }]),
    changesJson: { detections: rawDetections.length }
  })

  // Create bySyncRecordings
  const recordingMinutes = Array.from({ length: 12 }, (_, i) => i * 5)
  const recordingsBySyncSiteHour: SourceRecordingBySyncSiteHour[] = Object.values(groupBy(rawDetections, d => `${d.date}${d.hour}${d.arbimon_site_id}`))
    .map(ds => ds[0])
    .map(d => {
      const projectSiteId = siteArbimonToBio[d.arbimon_site_id]
      if (!projectSiteId) throw new Error('Site missing')

      return {
        timePrecisionHourLocal: new Date(new Date(d.date).getTime() + d.hour * 60 * 60 * 1000),
        sourceSyncId: sync.id,
        projectSiteId: siteArbimonToBio[d.arbimon_site_id],
        recordingMinutes: recordingMinutes.toString()
      }
    })

  await models.SourceRecordingBySyncSiteHour.bulkCreate(recordingsBySyncSiteHour)

  // Create bySyncDetections
  const detectionsBySyncSiteSpeciesHour: SourceDetectionBySyncSiteSpeciesHour[] = rawDetections
    .map(d => {
      const projectSiteId = siteArbimonToBio[d.arbimon_site_id]
      const taxonSpeciesId = speciesArbimonToBio[d.species_id]
      if (!projectSiteId || !taxonSpeciesId) return undefined

      return {
        timePrecisionHourLocal: new Date(new Date(d.date).getTime() + d.hour * 60 * 60 * 1000),
        projectSiteId,
        taxonSpeciesId,
        sourceSyncId: sync.id,
        detectionMinutes: recordingMinutes.slice(0, d.num_of_recordings).toString()
      }
    })
    .filter(isDefined)

  await models.SourceDetectionBySyncSiteSpeciesHour.bulkCreate(detectionsBySyncSiteSpeciesHour)

  // Link sync to version
  await models.ProjectVersionSourceSync.create({
    projectVersionId: latestProjectVersion.id,
    sourceSyncId: sync.id
  })

  // Update byVersion
  await sequelize.query(`
    INSERT INTO materialized_by_version_site_hour_recording (time_precision_hour_local, project_version_id, project_site_id, created_at, updated_at, count_recording_minutes)
    SELECT time_precision_hour_local, project_version_id, project_site_id, created_at, updated_at, count_recording_minutes
    FROM by_version_site_hour_recording
  `, { type: QueryTypes.INSERT })

  await sequelize.query(`
    INSERT INTO materialized_by_version_site_species_hour_detection (time_precision_hour_local, project_version_id, project_site_id, taxon_species_id, created_at, updated_at, taxon_class_id, count_detection_minutes)
    SELECT time_precision_hour_local, project_version_id, project_site_id, taxon_species_id, created_at, updated_at, taxon_class_id, count_detection_minutes
    FROM by_version_site_species_hour_detection
  `, { type: QueryTypes.INSERT })
}
