import { Op, Sequelize } from 'sequelize'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project } from '@rfcx-bio/common/dao/types'
import { SafeParseReturnType, z } from 'zod'

const ProjectArbimonSchema = z.object({
  idArbimon: z.number(),
  idCore: z.string(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string(),
  latitudeNorth: z.number(),
  latitudeSouth: z.number(),
  longitudeEast: z.number(),
  longitudeWest: z.number(),
  deletedAt: z.string().nullable()
})

export type ProjectArbimon = z.infer<typeof ProjectArbimonSchema>

export const parseProjectArbimonToBio = (projectArbimon: unknown): SafeParseReturnType<unknown, ProjectArbimon> =>
  ProjectArbimonSchema.safeParse(projectArbimon)

export const transformProjectArbimonToProjectBio = (project: ProjectArbimon): Omit<Project, 'id'> => ({ ...project })

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

  return [ itemsToInsertOrUpsert, itemsToDelete ]
}
