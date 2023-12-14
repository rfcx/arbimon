import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type LocationProjectProfile, type Project } from '@rfcx-bio/common/dao/types'

import { getImageByObjectives } from '@/project-profile/utils/image-by-objective'
import { getSequelize } from '~/db'
import { uniqueSlug } from './project-create-util-slug-finder'

export const createProject = async (projectPartial: Pick<Project, 'idArbimon' | 'idCore' | 'name'> & { objectives?: string[], dateStart?: Date, dateEnd?: Date }): Promise<string> => {
  const sequelize = getSequelize()
  const { LocationProject, LocationProjectProfile } = ModelRepository.getInstance(sequelize)

  const slug = await uniqueSlug(projectPartial.name, async (slug) => await LocationProject.count({ where: { slug } }).then(x => x === 0))

  const projectDefaults = { latitudeNorth: 0, latitudeSouth: 0, longitudeEast: 0, longitudeWest: 0 }
  const project = { ...projectDefaults, ...projectPartial, slug }
  const { id } = await LocationProject.create(project)

  // TODO: This should be in a project-profile-dao and called from the bll
  const profile: LocationProjectProfile = {
    locationProjectId: id,
    summary: '',
    readme: '',
    methods: '',
    keyResult: '',
    resources: '',
    image: getImageByObjectives(projectPartial.objectives),
    objectives: projectPartial.objectives ?? [],
    dateStart: projectPartial.dateStart ?? null,
    dateEnd: projectPartial.dateEnd ?? null
  }
  await LocationProjectProfile.create(profile)

  return slug
}
