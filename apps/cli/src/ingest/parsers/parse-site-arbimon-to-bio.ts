import { groupBy } from 'lodash-es'
import { Op, Sequelize } from 'sequelize'
import { SafeParseReturnType, z } from 'zod'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Site } from '@rfcx-bio/common/dao/types'

const SiteArbimonSchema = z.object({
  idArbimon: z.number(),
  idCore: z.string(),
  projectIdArbimon: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  altitude: z.number(),
  deletedAt: z.string().nullable()
})

export type SiteArbimon = z.infer<typeof SiteArbimonSchema>

export const parseSiteArbimon = (siteArbimon: unknown): SafeParseReturnType<unknown, SiteArbimon> =>
  SiteArbimonSchema.safeParse(siteArbimon)

export const transformArbimonSites = async (sites: SiteArbimon[], sequelize: Sequelize): Promise<Array<Omit<Site, 'id'>>> => {
  const arbimonSitesGroupByProject = groupBy(sites, 'projectIdArbimon')

  // get distinct bio project ids
  const bioProjects = await ModelRepository.getInstance(sequelize).LocationProject.findAll({
    where: { idArbimon: { [Op.in]: Object.keys(arbimonSitesGroupByProject) } },
    attributes: ['id', 'idArbimon'],
    raw: true
  }).then(results => Object.fromEntries(results.map(p => [p.idArbimon, p.id])))

  // map bio project id into site object
  return sites.map(site => ({
    ...site,
    locationProjectId: bioProjects[site.projectIdArbimon]
  }))
}
