import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type Project } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '~/db'
import { uniqueSlug } from '../project-create-util-slug-finder'

export const createProject = async (projectPartial: Pick<Project, 'idArbimon' | 'idCore' | 'name'>, hidden: boolean = false): Promise<{ id: number, slug: string }> => {
  const sequelize = getSequelize()
  const { LocationProject } = ModelRepository.getInstance(sequelize)

  const slug = await uniqueSlug(projectPartial.name, async (slug) => await LocationProject.count({ where: { slug }, paranoid: false }).then(x => x === 0))

  const projectDefaults = { latitudeNorth: 0, latitudeSouth: 0, longitudeEast: 0, longitudeWest: 0 }
  const project: Omit<Project, 'id'> = { ...projectDefaults, ...projectPartial, slug, status: hidden ? 'hidden' : 'unlisted', statusUpdatedAt: new Date() }
  const { id } = await LocationProject.create(project)

  return { id, slug }
}
