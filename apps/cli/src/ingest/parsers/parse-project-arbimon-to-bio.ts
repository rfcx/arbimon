import { type Sequelize, Op } from 'sequelize'
import { type SafeParseReturnType, z } from 'zod'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type Project, type ProjectStatus } from '@rfcx-bio/node-common/dao/types'

const ProjectArbimonSchema = z.object({
  idArbimon: z.number(),
  idCore: z.string(),
  slug: z.string().regex(/^[a-zA-Z0-9]+(?:(-|_)[a-zA-Z0-9]+)*$/),
  name: z.string(),
  latitudeNorth: z.number(),
  latitudeSouth: z.number(),
  longitudeEast: z.number(),
  longitudeWest: z.number(),
  isPrivate: z.number().nonnegative().lte(1),
  updatedAt: z.union([z.date(), z.string()]),
  deletedAt: z.union([z.date(), z.string()]).nullable()
})

export type ProjectArbimon = z.infer<typeof ProjectArbimonSchema>

export const parseProjectArbimonToBio = (projectArbimon: unknown): SafeParseReturnType<unknown, ProjectArbimon> =>
  ProjectArbimonSchema.safeParse(projectArbimon)

const transformProjectArbimonToProjectBio = (project: ProjectArbimon): Omit<Project, 'id' | 'statusUpdatedAt'> => {
  const { updatedAt, deletedAt, isPrivate, ...rest } = project
  return { ...rest, status: (isPrivate ? 'unlisted' : 'published') as ProjectStatus }
}

export const getTransformedProjects = async (projects: ProjectArbimon[], sequelize: Sequelize): Promise<any[]> => {
  const notDeletedProjects = projects.filter(project => project.deletedAt === null)
  const itemsToInsertOrUpsert = notDeletedProjects.map(transformProjectArbimonToProjectBio)

  const deletedProjects = projects.filter(project => project.deletedAt !== null)
  const idsArbimon = deletedProjects.map(project => project.idArbimon)
  // TODO: There should NOT be a call to the database here
  const itemsToDelete = await ModelRepository.getInstance(sequelize).LocationProject.findAll({
    where: {
      idArbimon: { [Op.in]: idsArbimon }
    },
    raw: true
  }) as unknown as Project[]

  return [itemsToInsertOrUpsert, itemsToDelete]
}
