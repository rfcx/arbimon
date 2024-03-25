import { type CoreClassifierJobSummary } from '~/api-core/types'

export const getUnvalidatedCount = (reviewStatus: CoreClassifierJobSummary): number => {
  return reviewStatus.total - (reviewStatus.uncertain + reviewStatus.confirmed + reviewStatus.rejected)
}
