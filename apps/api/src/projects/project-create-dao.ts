import { objectiveTypes } from '@rfcx-bio/common/dao/master-data/project-objective'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type Project, type ProjectObjective } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '~/db'
import { uniqueSlug } from './project-create-util-slug-finder'

export const createProject = async (projectPartial: Pick<Project, 'idArbimon' | 'idCore' | 'name'> & { objectives: string[], dateStart: Date | null, dateEnd: Date | null }): Promise<string> => {
  const sequelize = getSequelize()
  const { LocationProject, LocationProjectProfile } = ModelRepository.getInstance(sequelize)

  const slug = await uniqueSlug(projectPartial.name, async (slug) => await LocationProject.count({ where: { slug } }).then(x => x === 0))

  const projectDefaults = { latitudeNorth: 0, latitudeSouth: 0, longitudeEast: 0, longitudeWest: 0 }
  const project = { ...projectDefaults, ...projectPartial, slug }
  const { id } = await LocationProject.create(project)

  const image = objectiveTypes.find((objective: ProjectObjective) => objective.slug === projectPartial.objectives[0])?.imageUrl ?? ''

  const profile = {
    locationProjectId: id,
    summary: '',
    readme: '',
    methods: '',
    keyResult: '',
    resources: '',
    image, // TODO: #1319 randomly pick default image by objective
    objectives: projectPartial.objectives,
    dateStart: projectPartial.dateStart,
    dateEnd: projectPartial.dateEnd
  }
  await LocationProjectProfile.create(profile)

  return slug
}
