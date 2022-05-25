import { groupBy, mapValues } from 'lodash-es'

import { AllModels } from '@rfcx-bio/common/dao/model-repository'
import { DetectionByVersionSiteSpeciesHour, Project, ProjectSite, ProjectVersion, RecordingByVersionSiteHour } from '@rfcx-bio/common/dao/types'

export type SiteAutoProject = Omit<ProjectSite, 'projectId' | 'projectVersionFirstAppearsId'>
export type DetectionAutoProject = Omit<DetectionByVersionSiteSpeciesHour, 'projectVersionId'>
export type RecordingAutoProject = Omit<RecordingByVersionSiteHour, 'projectVersionId'>

export const createProjectWithDetections = async (
  models: AllModels,
  project: Project,
  sites: SiteAutoProject[],
  detections: DetectionAutoProject[],
  recordings?: RecordingAutoProject[]
): Promise<void> => {
  // Create mock project
  await models.Project.create(project)

  // Create mock project version
  const projectVersion: ProjectVersion = {
    id: project.id,
    projectId: project.id,
    isPublished: true,
    isPublic: true
  }
  await models.ProjectVersion.create(projectVersion)

  // Create mock projects sites
  const sitesFull: ProjectSite[] = sites.map(s => ({
    ...s,
    projectId: project.id,
    projectVersionFirstAppearsId: projectVersion.id

  }))
  await models.ProjectSite.bulkCreate(sitesFull)

  // Create mock detections
  const detectionsFull: DetectionByVersionSiteSpeciesHour[] = detections.map(d => ({
    ...d,
    projectVersionId: projectVersion.id
  }))
  await models.DetectionByVersionSiteSpeciesHour.bulkCreate(detectionsFull)

  // Create mock recordings
  const recordingsFull: RecordingByVersionSiteHour[] = recordings
    ? recordings.map(r => ({
      ...r,
      projectVersionId: projectVersion.id
    }))
    : recordingsFromDetections(detectionsFull)
  await models.RecordingByVersionSiteHour.bulkCreate(recordingsFull)
}

const recordingsFromDetections = (detections: DetectionByVersionSiteSpeciesHour[]): RecordingByVersionSiteHour[] => {
  // Pretend detection minutes === recording minutes
  const recordingsWithDupes = detections.map(({ timePrecisionHourLocal, projectVersionId, projectSiteId, countDetectionMinutes: countRecordingMinutes }) =>
    ({ timePrecisionHourLocal, projectVersionId, projectSiteId, countRecordingMinutes }))

  // Merge 1 row per species => 1 row (taking max "countRecordingMinutes")
  return Object.values(
    mapValues(
      groupBy(recordingsWithDupes, ({ timePrecisionHourLocal, projectVersionId, projectSiteId }) => `${timePrecisionHourLocal.getTime()}-${projectVersionId}-${projectSiteId}`),
      vs => ({ ...vs[0], countRecordingMinutes: Math.max(...vs.map(v => v.countRecordingMinutes)) })
    )
  )
}
