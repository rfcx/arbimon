import { groupBy } from 'lodash-es'
import { type Sequelize, Op } from 'sequelize'
import { type SafeParseReturnType, z } from 'zod'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type Site } from '@rfcx-bio/common/dao/types'

const SiteArbimonRowSchema = z.object({
  idArbimon: z.number(),
  idCore: z.string(),
  projectIdArbimon: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  countryCode: z.string().nullable(),
  altitude: z.number(),
  deletedAt: z.date().nullable(),
  hidden: z.number()
})

const SiteArbimonSchema = z.object({
  idArbimon: z.number(),
  idCore: z.string(),
  projectIdArbimon: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  countryCode: z.string().nullable(),
  altitude: z.number(),
  deletedAt: z.string().nullable(),
  hidden: z.number()
})

export type SiteArbimonRow = z.infer<typeof SiteArbimonRowSchema>
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
    locationProjectId: bioProjects[site.projectIdArbimon],
    hidden: site.hidden === 1
  }))
}
