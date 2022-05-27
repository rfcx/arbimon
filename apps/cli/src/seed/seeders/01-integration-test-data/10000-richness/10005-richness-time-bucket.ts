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

const projectId = 10005001
const siteId1 = 10005001
const siteId2 = 10005002
const siteId3 = 10005003

const testProject = defineTestProject(projectId, 'Richness Time Bucket')

const testSites: SiteAutoProject[] = [
  {
    id: siteId1,
    idCore: 'ts10005001',
    idArbimon: siteId1,
    name: 'Test Site 5001',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: siteId2,
    idCore: 'ts10005002',
    idArbimon: siteId2,
    name: 'Test Site 5002',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  },
  {
    id: siteId3,
    idCore: 'ts10005003',
    idArbimon: siteId3,
    name: 'Test Site 5003',
    latitude: 18.31307,
    longitude: -65.24878,
    altitude: 30.85246588
  }
]

const testDetectionsByVersionSiteSpeciesHour: DetectionAutoProject[] = [
  {
    timePrecisionHourLocal: new Date('2021-12-31T23:00:00.000Z'), // Friday 31 Dec, 2021 (month end, year end cases)
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(1),
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2022-01-01T00:00:00.000Z'), // Saturday 1 Jan, 2022 (month start, year start cases)
    projectSiteId: siteId1,
    ...taxonSpeciesAndClassForId(2),
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2022-01-02T00:00:00.000Z'), // Sunday 2 Jan, 2022 (week start)
    projectSiteId: siteId2,
    ...taxonSpeciesAndClassForId(3),
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2022-01-08T23:00:00.000Z'), // Saturday 8 Jan, 2022 (week end)
    projectSiteId: siteId3,
    ...taxonSpeciesAndClassForId(4),
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2022-02-17T17:00:00.000Z'), // Thursday 17 Feb, 2022 (random)
    projectSiteId: siteId3,
    ...taxonSpeciesAndClassForId(4),
    countDetectionMinutes: 10
  },
  {
    timePrecisionHourLocal: new Date('2022-02-17T17:00:00.000Z'), // Thursday 17 Feb, 2022 (random)
    projectSiteId: siteId3,
    ...taxonSpeciesAndClassForId(1),
    countDetectionMinutes: 10
  }
]
