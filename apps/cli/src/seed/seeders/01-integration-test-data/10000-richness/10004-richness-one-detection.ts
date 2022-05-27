import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { taxonSpeciesAndClassForId } from '@/seed/data/integration/test-taxon-species'
import { createProjectWithDetections, DetectionAutoProject, SiteAutoProject } from '../../_helpers/create-project-with-detections'
import { defineTestProject } from '../../_helpers/define-test-project'

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  // Create mock project, version, sites, detections, recordings
  await createProjectWithDetections(
    models,
    testProject,
    testSites,
    testDetectionsByVersionSiteSpeciesHour
  )
}

const projectId = 10004001
const siteId1 = 10004001

const testProject = defineTestProject(projectId, 'Richness One Detection')

const testSites: SiteAutoProject[] = [
  {
    id: siteId1,
    idCore: 'testSite0004',
    idArbimon: siteId1,
    name: 'Test Site 4',
    latitude: 20.31307,
    longitude: -80.24878,
    altitude: 30.85246588
  }
]

const testDetectionsByVersionSiteSpeciesHour: DetectionAutoProject[] = [
  {
    timePrecisionHourLocal: new Date('2021-02-11T11:00:00.000Z'),
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(3),
    countDetectionMinutes: 1
  }
]
