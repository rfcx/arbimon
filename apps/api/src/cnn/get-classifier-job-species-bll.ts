import { type ClassifierJobSpecies, type GetClassifierJobSpeciesQueryParams, validSortParams } from '@rfcx-bio/common/api-bio/cnn/classifier-job-species'

import { parseLimitOffset } from '@/search/helpers'
import { getClassifierJobSummaries } from '~/api-core/api-core'
import { BioInvalidPathParamError, BioInvalidQueryParamError } from '~/errors'
import { getUnvalidatedCount } from '~/maths'

export const getClassifierJobSpecies = async (token: string, jobId: string | undefined, params: GetClassifierJobSpeciesQueryParams): Promise<{ total: number, data: ClassifierJobSpecies[] }> => {
  if (jobId === undefined || jobId === null || jobId === '' || Number.isNaN(Number(jobId))) {
    throw BioInvalidPathParamError({ jobId })
  }

  if (params?.sort !== undefined && !validSortParams.includes(params.sort)) {
    throw BioInvalidQueryParamError({ sort: params?.sort })
  }

  if (
    params?.order !== undefined && !['asc', 'desc'].includes(params.order)
  ) {
    throw BioInvalidQueryParamError({ order: params.order })
  }

  // Empty string in ilike clause will return nothing
  if (params?.q === '') {
    params.q = undefined
  }

  const { limit, offset } = parseLimitOffset(params.limit, params.offset, { defaultLimit: 25 })
  const summaries = await getClassifierJobSummaries(token, Number(jobId), {
    keyword: params?.q,
    limit,
    offset,
    sort: params?.sort,
    order: params?.order
  })

  return {
    total: summaries.total,
    data: summaries.data.classificationsSummary.map(c => {
      return {
        title: c.title,
        value: c.value,
        image: c.image,
        unvalidated: getUnvalidatedCount(c),
        notPresent: c.rejected,
        unknown: c.uncertain,
        present: c.confirmed
      }
    })
  }
}
