import { beforeAll, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getPopulatedArbimonInMemorySequelize } from '@/data-ingest/_testing/arbimon'
import { getSequelize } from '@/db/connections'
import { syncProjects } from '@/sync/arbimon'

// Arrange
const testProjectIdArbimon = 1920
const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = getSequelize()

beforeAll(async () => {
  await syncProjects(arbimonSequelize, biodiversitySequelize)
})
test('New project created', async () => {
  // Assert
  const models = ModelRepository.getInstance(biodiversitySequelize)
  const project = await models.LocationProject.findOne({ where: { idArbimon: testProjectIdArbimon } })
  expect(project).toBeDefined()
})

test('Project name updated', async () => {
  const projectName = 'Kitty at NU'
  void arbimonSequelize.query(`update projects set name = '${projectName}'`)

  // Act
  await syncProjects(arbimonSequelize, biodiversitySequelize)

  // Assert
  const project = await ModelRepository.getInstance(biodiversitySequelize)
    .LocationProject
    .findOne({ where: { idArbimon: testProjectIdArbimon } })
    expect(project?.name).toBe(projectName)
})

test('Project slug updated', async () => {
  const projectSlug = 'rfcx-phits'
  void arbimonSequelize.query(`
    UPDATE projects
    SET url = '${projectSlug}'
    WHERE project_id = '${testProjectIdArbimon}';
  `)

  // Act
  await syncProjects(arbimonSequelize, biodiversitySequelize)

  // Assert
  const project = await ModelRepository.getInstance(biodiversitySequelize)
    .LocationProject
    .findOne({ where: { idArbimon: testProjectIdArbimon } })
    expect(project?.slug).toBe(projectSlug)
})

test('Project location updated', async () => {
  const updatedSite = {
    id: 88526,
    lattitude: 16.7
  }
  void arbimonSequelize.query(`
    UPDATE sites
    SET lat = ${updatedSite.lattitude}
    WHERE site_id = '${updatedSite.id}';
  `)

  // Act
  await syncProjects(arbimonSequelize, biodiversitySequelize)

  // Assert
  const project = await ModelRepository.getInstance(biodiversitySequelize)
    .LocationProject
    .findOne({ where: { idArbimon: testProjectIdArbimon } })
    expect(project?.latitudeNorth).toBe(updatedSite.lattitude)
})
