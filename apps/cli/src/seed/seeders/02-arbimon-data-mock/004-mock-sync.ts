import { groupBy } from 'lodash-es'
import { QueryInterface, QueryTypes } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterSources } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionBySourceSiteSpeciesHour, RecordingBySourceSiteHour } from '@rfcx-bio/common/dao/types'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { rawDetections } from '@/seed/data/manual/detections-by-hour'
import { getPuertoRicoProjectId } from '../_helpers/get-puerto-rico-id'

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

  // Create recording by source
  const recordingMinutes = Array.from({ length: 12 }, (_, i) => i * 5)
  const recordingsBySyncSiteHour: RecordingBySourceSiteHour[] = Object.values(groupBy(rawDetections, d => `${d.date}${d.hour}${d.arbimon_site_id}`))
    .map(ds => ds[0])
    .map(d => {
      const projectSiteId = siteArbimonToBio[d.arbimon_site_id]
      if (!projectSiteId) throw new Error('Site missing')

      return {
        timePrecisionHourLocal: new Date(new Date(d.date).getTime() + d.hour * 60 * 60 * 1000),
        sourceId: masterSources.ArbimonValidated.id,
        projectId,
        projectSiteId: siteArbimonToBio[d.arbimon_site_id],
        recordingMinutes: recordingMinutes.toString()
      }
    })

  await models.RecordingBySourceSiteHour.bulkCreate(recordingsBySyncSiteHour)

  // Create detections by source
  const detectionsBySyncSiteSpeciesHour: DetectionBySourceSiteSpeciesHour[] = rawDetections
    .map(d => {
      const projectSiteId = siteArbimonToBio[d.arbimon_site_id]
      const taxonSpeciesId = speciesArbimonToBio[d.species_id]
      if (!projectSiteId || !taxonSpeciesId) return undefined

      return {
        timePrecisionHourLocal: new Date(new Date(d.date).getTime() + d.hour * 60 * 60 * 1000),
        projectId,
        projectSiteId,
        taxonSpeciesId,
        sourceId: masterSources.ArbimonValidated.id,
        detectionMinutes: recordingMinutes.slice(0, d.num_of_recordings).toString()
      }
    })
    .filter(isDefined)

  await models.DetectionBySourceSiteSpeciesHour.bulkCreate(detectionsBySyncSiteSpeciesHour)

  // Update recordings/detections by version
  await sequelize.query(
    `
      INSERT INTO recording_by_version_site_hour (time_precision_hour_local, project_version_id, project_site_id, created_at, updated_at, count_recording_minutes)
      SELECT rbssh.time_precision_hour_local,
      $projectVersionId,
      rbssh.project_site_id,
      rbssh.created_at,
      rbssh.updated_at,
      length(regexp_replace(rbssh.recording_minutes, '[^,]', '', 'g')) + 1
      FROM recording_by_source_site_hour rbssh
    `,
    { type: QueryTypes.INSERT, bind: { projectVersionId: latestProjectVersion.id } }
  )

  await sequelize.query(
    `
      INSERT INTO detection_by_version_site_species_hour (time_precision_hour_local, project_version_id, project_site_id, taxon_species_id, created_at, updated_at, taxon_class_id, count_detection_minutes)
      SELECT dbsssh.time_precision_hour_local,
            $projectVersionId,
            dbsssh.project_site_id,
            dbsssh.taxon_species_id,
            dbsssh.created_at,
            dbsssh.updated_at,
            ts.taxon_class_id,
            length(regexp_replace(dbsssh.detection_minutes, '[^,]', '', 'g')) + 1
      FROM detection_by_source_site_species_hour dbsssh
      JOIN taxon_species ts on dbsssh.taxon_species_id = ts.id
    `,
    { type: QueryTypes.INSERT, bind: { projectVersionId: latestProjectVersion.id } }
  )
}
