import { Op, Sequelize } from 'sequelize'
import { SafeParseReturnType, z } from 'zod'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { LocationProjectProfile, Project } from '@rfcx-bio/common/dao/types'

const ProjectArbimonRowSchema = z.object({
  idArbimon: z.number(),
  idCore: z.string(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string(),
  updatedAt: z.date(),
  latitudeNorth: z.number(),
  latitudeSouth: z.number(),
  longitudeEast: z.number(),
  longitudeWest: z.number(),
  deletedAt: z.date().nullable(),
  description: z.string().nullable()
})

const ProjectArbimonSchema = z.object({
  idArbimon: z.number(),
  idCore: z.string(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string(),
  latitudeNorth: z.number(),
  latitudeSouth: z.number(),
  longitudeEast: z.number(),
  longitudeWest: z.number(),
  deletedAt: z.string().nullable(),
  description: z.string().nullable()
})

export type ProjectArbimonRow = z.infer<typeof ProjectArbimonRowSchema>
export type ProjectArbimon = z.infer<typeof ProjectArbimonSchema>

export const parseProjectArbimonToBio = (projectArbimon: unknown): SafeParseReturnType<unknown, ProjectArbimon> =>
  ProjectArbimonSchema.safeParse(projectArbimon)

const transformProjectArbimonToProjectBio = (project: ProjectArbimon): Omit<Project, 'id'> => ({ ...project })

export const getTransformedProjects = async (projects: ProjectArbimon[], sequelize: Sequelize): Promise<any[]> => {
  const notDeletedProjects = projects.filter(project => project.deletedAt === null)
  const itemsToInsertOrUpsert = notDeletedProjects.map(transformProjectArbimonToProjectBio)

  const deletedProjects = projects.filter(project => project.deletedAt !== null)
  const idsArbimon = deletedProjects.map(project => project.idArbimon)
  const itemsToDelete = await ModelRepository.getInstance(sequelize).LocationProject.findAll({
    where: {
      idArbimon: { [Op.in]: idsArbimon }
    },
    raw: true
  }) as unknown as Project[]

  return [itemsToInsertOrUpsert, itemsToDelete]
}

export const getLocationProjectProfile = async (projects: ProjectArbimon[], sequelize: Sequelize): Promise<any[]> => {
  const notDeletedProjects = projects.filter(project => project.deletedAt === null)

  const idsArbimon = notDeletedProjects.map(project => project.idArbimon)
  const bioProjects = await ModelRepository.getInstance(sequelize).LocationProject.findAll({
    where: {
      idArbimon: { [Op.in]: idsArbimon }
    },
    raw: true
  }) as unknown as Project[]

  const itemsToInsertOrUpsert = bioProjects.map((project: Project) => {
    const description = notDeletedProjects.find(item => item.idArbimon === project.idArbimon)?.description
    return {
      locationProjectId: project.id,
      summary: '',
      readme: description !== null ? description : ''
    }
  }) as LocationProjectProfile[]

  return itemsToInsertOrUpsert
}
