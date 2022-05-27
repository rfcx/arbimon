import { groupBy, mapValues } from 'lodash-es'

import { AllModels } from '@rfcx-bio/common/dao/model-repository'
import { DetectionByVersionSiteSpeciesHour, Project, ProjectSite, ProjectVersion, RecordingByVersionSiteHour } from '@rfcx-bio/common/dao/types'

export type SiteAutoProject = Omit<ProjectSite, 'projectId' | 'projectVersionFirstAppearsId'>
export type DetectionAutoProject = Omit<DetectionByVersionSiteSpeciesHour, 'projectId' | 'projectVersionId'>
export type RecordingAutoProject = Omit<RecordingByVersionSiteHour, 'projectId' | 'projectVersionId'>

export const createProjectWithDetections = async (
  models: AllModels,
  project: Project,
  sites: SiteAutoProject[] = [],
  detections: DetectionAutoProject[] = [],
  recordings: RecordingAutoProject[] = fakeRecordingsFromDetections(detections)
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
  await models.ProjectSite.bulkCreate(sites.map(s => ({
    ...s,
    projectId: project.id,
    projectVersionFirstAppearsId: projectVersion.id
  })))

  // Create mock detections
  await models.DetectionByVersionSiteSpeciesHour.bulkCreate(detections.map(d => ({
    ...d,
    projectId: project.id,
    projectVersionId: projectVersion.id
  })))

  // Create mock recordings
  await models.RecordingByVersionSiteHour.bulkCreate(recordings.map(r => ({
    ...r,
    projectId: project.id,
    projectVersionId: projectVersion.id
  })))
}

const fakeRecordingsFromDetections = (detections: DetectionAutoProject[]): RecordingAutoProject[] => {
  if (detections.length === 0) return []

  // Pretend detection minutes === recording minutes
  const recordingsWithDupes = detections.map(({ timePrecisionHourLocal, projectSiteId, countDetectionMinutes: countRecordingMinutes }) =>
    ({ timePrecisionHourLocal, projectSiteId, countRecordingMinutes }))

  // Merge 1 row per species => 1 row (taking max "countRecordingMinutes")
  return Object.values(
    mapValues(
      groupBy(recordingsWithDupes, ({ timePrecisionHourLocal, projectSiteId }) => `${timePrecisionHourLocal.getTime()}-${projectSiteId}`),
      vs => ({ ...vs[0], countRecordingMinutes: Math.max(...vs.map(v => v.countRecordingMinutes)) })
    )
  )
}
