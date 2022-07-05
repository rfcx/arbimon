import { groupBy } from 'lodash-es'
import { Op, Sequelize } from 'sequelize'
import { SafeParseReturnType, z } from 'zod'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Site } from '@rfcx-bio/common/dao/types'

const SiteArbimonSchema = z.object({
  idArbimon: z.number(),
  idCore: z.string(),
  projectIdArbimon: z.number(),
  locationProjectId: z.optional(z.number()),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  altitude: z.number()
})

export type SiteArbimon = z.infer<typeof SiteArbimonSchema>

export const parseSiteArbimonToBio = (siteArbimon: unknown): SafeParseReturnType<unknown, SiteArbimon> =>
SiteArbimonSchema.safeParse(siteArbimon)

export const mapSitesArbimonWithBioFk = async (siteDataArbimon: SiteArbimon[], sequelize: Sequelize): Promise<SiteArbimon[]> => {
  const arbimonSitesGroupByProject = groupBy(siteDataArbimon, 'projectIdArbimon')

  // get distinct bio project ids
  const biodiversityProjects = (await ModelRepository.getInstance(sequelize).LocationProject.findAll({
    where: { idArbimon: { [Op.in]: Object.keys(arbimonSitesGroupByProject) } },
    raw: true
  }))

  // map bio project id into site object
  return siteDataArbimon.map(site => ({
    ...site,
    locationProjectId: biodiversityProjects.find(project => project.idArbimon === site.projectIdArbimon)?.id ?? undefined
  }))
}

export const transformSiteArbimonToSiteBio = (siteArbimon: SiteArbimon): Omit<Site, 'id'> => ({
  ...siteArbimon,
  locationProjectId: siteArbimon.locationProjectId ?? -1
})
