import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project } from '@rfcx-bio/common/dao/types'

import { createProjectWithDetections, DetectionAutoProject, SiteAutoProject } from '@/seed/_helpers/create-project-with-detections'

const testProject: Project = {
  id: 10004,
  idCore: 'integration1',
  idArbimon: 10004001,
  slug: 'integration-test-project4',
  name: 'Integration Test Project 4'
}

const testSites: SiteAutoProject[] = [
  {
    id: 10004,
    idCore: 'testSite0004',
    idArbimon: 1111224,
    name: 'Test Site 4',
    latitude: 20.31307,
    longitude: -80.24878,
    altitude: 30.85246588
  }
]

const testDetectionsByVersionSiteSpeciesHour: DetectionAutoProject[] = [
  {
    timePrecisionHourLocal: new Date('2021-02-11T11:00:00.000Z'),
    projectSiteId: 10004,
    taxonSpeciesId: 3,
    taxonClassId: 300,
    countDetectionMinutes: 1
  }
]

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize
  const models = ModelRepository.getInstance(sequelize)

  // Create mock project, version, sites, detections, recordings
  await createProjectWithDetections(
    models,
    testProject,
    testSites,
    testDetectionsByVersionSiteSpeciesHour
  )
}
