import { type PublicationsResponse, type PublicationTechnique } from '@rfcx-bio/common/api-bio/publications/publications'

import { getSequelize } from '~/db'
import { type PublicationsFilter, countPublications, getTechniqueFacets, listPublications, listTechniques } from './publications-dao'

export const getPublications = async (filter: PublicationsFilter): Promise<PublicationsResponse> => {
  const sequelize = getSequelize()

  const [total, items, techniqueFacets] = await Promise.all([
    countPublications(sequelize, filter),
    listPublications(sequelize, filter),
    getTechniqueFacets(sequelize, filter)
  ])

  return {
    total,
    limit: filter.limit,
    offset: filter.offset,
    items,
    techniqueFacets
  }
}

export const getPublicationTechniques = async (): Promise<PublicationTechnique[]> => {
  const sequelize = getSequelize()
  return await listTechniques(sequelize)
}
