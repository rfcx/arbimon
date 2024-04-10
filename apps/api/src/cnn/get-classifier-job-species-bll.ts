import { type ClassifierJobSpecies, type GetClassifierJobSpeciesQueryParams, validSortColumns } from '@rfcx-bio/common/api-bio/cnn/classifier-job-species'
import { SortCondition } from '@rfcx-bio/common/ordering'

import { parseLimitOffset } from '@/search/helpers'
import { getClassifierJobSummaries } from '~/api-core/api-core'
import { BioInvalidPathParamError } from '~/errors'

export const getClassifierJobSpecies = async (token: string, jobId: string | undefined, params: GetClassifierJobSpeciesQueryParams): Promise<{ total: number, data: ClassifierJobSpecies[] }> => {
  if (jobId === undefined || jobId === '' || Number.isNaN(Number(jobId))) {
    throw BioInvalidPathParamError({ jobId })
  }

  // Empty string in ilike clause will return nothing
  if (params?.q === '') {
    params.q = undefined
  }

  const conditions = new SortCondition(params?.sort ?? '')

  conditions.keep(validSortColumns)

  conditions.rename('unvalidated', 'unreviewed')
  conditions.rename('notPresent', 'rejected')
  conditions.rename('unknown', 'uncertain')
  conditions.rename('present', 'confirmed')

  const { limit, offset } = parseLimitOffset(params.limit, params.offset, { defaultLimit: 25 })
  const summaries = await getClassifierJobSummaries(token, Number(jobId), {
    keyword: params?.q,
    limit,
    offset,
    sort: conditions.toString() === '' ? undefined : conditions.toString()
  })

  return {
    total: summaries.total,
    data: summaries.data.classificationsSummary.map(c => {
      return {
        title: c.title,
        value: c.value,
        image: c.image,
        total: c.total,
        unvalidated: c.unreviewed,
        notPresent: c.rejected,
        unknown: c.uncertain,
        present: c.confirmed
      }
    })
  }
}
