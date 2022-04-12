import { describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project, ProjectSite } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { getPopulatedArbimonInMemorySequelize } from '@/ingest/_testing/arbimon'
import { createProjectVersionIfNeeded } from '@/ingest/outputs/project-version'
import { syncDaily } from '@/ingest/sync'
import { syncProjects } from '@/ingest/sync/arbimon'

// Arrange
const testProject = { id: 1346, idArbimon: 1920 }
const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = await getSequelize()

describe('First time sync', () => {
  test('New project created successfully', async () => {
    // Arrange
    // Act
    await syncProjects(arbimonSequelize, biodiversitySequelize)

    // Assert
    const project = await getProject(testProject.idArbimon)
    expect(project).toBeDefined()
    })

    test('New project version created successfully', async () => {
      // Arrange
      const projectVersionBeforeSync = await getProjectVersionCount(testProject.id)

      // Act
      await syncProjects(arbimonSequelize, biodiversitySequelize)
      const allProjectIds = (await ModelRepository.getInstance(biodiversitySequelize).Project.findAll({ raw: true })).map(p => p.id)
      await createProjectVersionIfNeeded(biodiversitySequelize, allProjectIds)

      // Assert
      const projectId = (await getProject(testProject.idArbimon))?.id ?? -1
      const projectVersionAfterSync = await getProjectVersionCount(projectId)

      expect(projectId).not.toBe(-1)
      expect(projectVersionBeforeSync).toBe(0)
      expect(projectVersionAfterSync).toBe(1)
      })

    test('Sites created with current project versions', async () => {
      // Act
      await syncDaily(arbimonSequelize, biodiversitySequelize)

      const projectVersionId = await getLastestProjectVersion(testProject.id)
      expect(projectVersionId).not.toBe(-1)

      const sites = await getSites(testProject.id)
      const siteProjectVersions = sites.map(s => s.projectVersionFirstAppearsId)
      siteProjectVersions.forEach(pvid => {
        expect(pvid).toBe(projectVersionId)
      })
    })
})

describe('Existing project sync', async () => {
  // Arrange
  await syncProjects(arbimonSequelize, biodiversitySequelize)

  test('Project - slug updated', async () => {
    const projectSlug = 'rfcx-th-updated'
    void arbimonSequelize.query(`
      UPDATE projects
      SET url = '${projectSlug}'
      WHERE project_id = '${testProject.idArbimon}';
    `)

    // Act
    await syncProjects(arbimonSequelize, biodiversitySequelize)

    // Assert
    const project = await ModelRepository.getInstance(biodiversitySequelize)
      .Project
      .findOne({ where: { idArbimon: testProject.idArbimon } })
      expect(project?.slugArbimon).toBe(projectSlug)
  })

  test('Project - name updated', async () => {
    const projectName = 'Kitty at NU'
    void arbimonSequelize.query(`update projects set name = '${projectName}'`)

    // Act
    await syncProjects(arbimonSequelize, biodiversitySequelize)

    // Assert
    const project = await ModelRepository.getInstance(biodiversitySequelize)
      .Project
      .findOne({ where: { idArbimon: testProject.idArbimon } })
      expect(project?.name).toBe(projectName)
  })

  test.todo('UPDATED: site - name updated')
  test.todo('UPDATED: site - location (lat, lon, alt) updated')
  test.todo('CREATED: new sites created with current project versions')
})

/* -- Helper -- */

const getProject = async (idArbimon: number): Promise<Project | null> => {
  const models = ModelRepository.getInstance(biodiversitySequelize)
  return await models.Project.findOne({ where: { idArbimon: testProject.idArbimon } })
}

const getProjectVersionCount = async (projectId: number): Promise<number> => {
  const models = ModelRepository.getInstance(biodiversitySequelize)
  return await models.ProjectVersion.count({ where: { projectId: projectId } })
}

const getLastestProjectVersion = async (projectId: number): Promise<number> => {
  const models = ModelRepository.getInstance(biodiversitySequelize)
  return await models.ProjectVersion.findOne({ where: { projectId: projectId }, order: [['createdAt', 'DESC']], raw: true }).then(pv => pv?.id ?? -1)
}

const getSites = async (projectId: number): Promise<ProjectSite[]> => {
  const models = ModelRepository.getInstance(biodiversitySequelize)
  return await models.ProjectSite.findAll({ where: { projectId: projectId }, raw: true })
}
